"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSchoolAdminRole } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { buildCsvText, parseSpreadsheetBuffer } from "@/lib/spreadsheet";
import type { ActionResult } from "@/app/actions/auth.actions";
import type { Database } from "@/types/db";
import type { UserRole } from "@/types/domain";

export interface OnboardingChecklistDto {
  schoolId: string;
  schoolCode: string;
  schoolName: string;
  profileDone: boolean;
  academicYearDone: boolean;
  classesSectionsDone: boolean;
  subjectsDone: boolean;
  feeStructureDone: boolean;
  teachersImportedDone: boolean;
  studentsImportedDone: boolean;
  parentsInvitedDone: boolean;
  completionPct: number;
  liveCounts: {
    academicYears: number;
    classes: number;
    subjects: number;
    teachers: number;
    students: number;
    guardians: number;
  };
}

export interface BulkImportPreviewRow {
  rowNum: number;
  key: string;
  label: string;
  detail: string;
  status: "Valid" | "Error";
  error?: string;
}

export interface BulkImportResultDto {
  jobId?: string;
  entityType: "students" | "guardians" | "teachers" | "staff" | "fees";
  totalRows: number;
  validCount: number;
  errorCount: number;
  createdCount: number;
  updatedCount: number;
  preview: BulkImportPreviewRow[];
  rowErrors: Array<{ row: number; error: string }>;
}

export interface GeneratedCredentialSlip {
  entityType: "student" | "teacher" | "staff" | "parent";
  loginId: string;
  fullName: string;
  email: string;
  classLabel: string;
  tempPassword: string;
}

export interface RolloverCandidateDto {
  studentId: string;
  admissionNo: string;
  rollNo: string;
  fullName: string;
  currentClassId: string | null;
  currentClassName: string;
  currentSection: string;
  feeBalanceInr: number;
  defaultAction: "Promote" | "Detain" | "Transfer";
}

async function requireSchoolAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase: null, admin: null, user: null, schoolId: "", schoolCode: "", error: "Sign in required." };
  }

  const admin = createAdminClient();
  const { data: prof } = await admin
    .from("profiles")
    .select("id, school_id, role, status, deleted_at")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!prof || !isSchoolAdminRole(prof.role as UserRole) || prof.status !== "Active") {
    return { supabase: null, admin: null, user: null, schoolId: "", schoolCode: "", error: "School Administrator privileges required." };
  }

  const { data: school } = await admin
    .from("schools")
    .select("id, school_code, name, status")
    .eq("id", prof.school_id)
    .single();

  if (!school) {
    return { supabase: null, admin: null, user: null, schoolId: "", schoolCode: "", error: "School not found." };
  }

  if (school.status === "read_only" || school.status === "suspended" || school.status === "cancelled") {
    return {
      supabase: null,
      admin: null,
      user: null,
      schoolId: school.id,
      schoolCode: school.school_code,
      error: `Workspace is in ${school.status} mode — mutations paused.`,
    };
  }

  return { supabase, admin, user, schoolId: school.id, schoolCode: school.school_code, schoolName: school.name, error: null };
}

// ---------- C1: Persisted School Onboarding Checklist ----------

export async function getOnboardingChecklistAction(): Promise<ActionResult<OnboardingChecklistDto>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const { data: prof } = await supabase
    .from("profiles")
    .select("school_id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!prof) return { ok: false, error: "Profile unavailable." };

  const admin = createAdminClient();
  const [schoolRes, onbRes, ayRes, clsRes, subjRes, tchRes, stuRes, grdRes] = await Promise.all([
    admin.from("schools").select("id, school_code, name").eq("id", prof.school_id).single(),
    admin.from("school_onboarding").select("*").eq("school_id", prof.school_id).maybeSingle(),
    admin.from("academic_years").select("id", { count: "exact", head: true }).eq("school_id", prof.school_id).is("deleted_at", null),
    admin.from("school_classes").select("id", { count: "exact", head: true }).eq("school_id", prof.school_id).is("deleted_at", null),
    admin.from("subjects").select("id", { count: "exact", head: true }).eq("school_id", prof.school_id).is("deleted_at", null),
    admin.from("staff_members").select("id", { count: "exact", head: true }).eq("school_id", prof.school_id).eq("category", "Teacher").is("deleted_at", null),
    admin.from("students").select("id", { count: "exact", head: true }).eq("school_id", prof.school_id).is("deleted_at", null),
    admin.from("guardians").select("id", { count: "exact", head: true }).eq("school_id", prof.school_id).is("deleted_at", null),
  ]);

  const row = onbRes.data;
  const profileDone = row?.profile_done ?? true;
  const academicYearDone = row?.academic_year_done || (ayRes.count ?? 0) > 0;
  const classesSectionsDone = row?.classes_sections_done || (clsRes.count ?? 0) > 0;
  const subjectsDone = row?.subjects_done || (subjRes.count ?? 0) > 0;
  const feeStructureDone = row?.fee_structure_done ?? false;
  const teachersImportedDone = row?.teachers_imported_done || (tchRes.count ?? 0) > 0;
  const studentsImportedDone = row?.students_imported_done || (stuRes.count ?? 0) > 0;
  const parentsInvitedDone = row?.parents_invited_done || (grdRes.count ?? 0) > 0;

  const doneItems = [
    profileDone,
    academicYearDone,
    classesSectionsDone,
    subjectsDone,
    feeStructureDone,
    teachersImportedDone,
    studentsImportedDone,
    parentsInvitedDone,
  ].filter(Boolean).length;

  return {
    ok: true,
    data: {
      schoolId: prof.school_id,
      schoolCode: schoolRes.data?.school_code ?? "SCHOOL",
      schoolName: schoolRes.data?.name ?? "School Workspace",
      profileDone,
      academicYearDone,
      classesSectionsDone,
      subjectsDone,
      feeStructureDone,
      teachersImportedDone,
      studentsImportedDone,
      parentsInvitedDone,
      completionPct: Math.round((doneItems / 8) * 100),
      liveCounts: {
        academicYears: ayRes.count ?? 0,
        classes: clsRes.count ?? 0,
        subjects: subjRes.count ?? 0,
        teachers: tchRes.count ?? 0,
        students: stuRes.count ?? 0,
        guardians: grdRes.count ?? 0,
      },
    },
  };
}

export async function toggleOnboardingStepAction(params: {
  stepKey:
    | "profile_done"
    | "academic_year_done"
    | "classes_sections_done"
    | "subjects_done"
    | "fee_structure_done"
    | "teachers_imported_done"
    | "students_imported_done"
    | "parents_invited_done";
  done: boolean;
}): Promise<ActionResult> {
  const auth = await requireSchoolAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const patch: Database["public"]["Tables"]["school_onboarding"]["Insert"] = {
    school_id: auth.schoolId,
  };
  patch[params.stepKey] = params.done;

  const { error } = await auth.admin.from("school_onboarding").upsert(
    patch,
    { onConflict: "school_id" },
  );
  if (error) return { ok: false, error: getErrorMessage(error, "Unable to update onboarding progress.") };
  revalidatePath("/admin/setup/onboarding");
  return { ok: true };
}

// ---------- C3: Chunked CSV/XLSX Bulk Import (5,000+ rows, dry-run & idempotent re-run) ----------

const TEMPLATE_HEADERS: Record<"students" | "guardians" | "teachers" | "staff" | "fees", string[]> = {
  students: ["admission_no", "full_name", "class_name", "section_name", "roll_no", "gender", "dob", "guardian_name", "guardian_phone", "guardian_email"],
  guardians: ["full_name", "relation", "phone", "email", "occupation", "student_admission_no"],
  teachers: ["employee_code", "full_name", "department", "designation", "qualification", "phone", "email", "base_salary_inr"],
  staff: ["employee_code", "full_name", "sub_role", "department", "designation", "phone", "email", "base_salary_inr"],
  fees: ["admission_no", "fee_balance_inr"],
};

export async function getBulkImportTemplateCsvAction(
  entityType: "students" | "guardians" | "teachers" | "staff" | "fees",
): Promise<string> {
  const sampleRow: Record<typeof entityType, Array<string>> = {
    students: ["ADM-2026-2001", "Aadhya Nair", "Grade 6", "A", "01", "Female", "2014-05-12", "Suresh Nair", "+91 98111 22334", "suresh.nair@example.in"],
    guardians: ["Suresh Nair", "Father", "+91 98111 22334", "suresh.nair@example.in", "Architect", "ADM-2026-2001"],
    teachers: ["TCH-201", "Ms. Priya Kulkarni", "Science", "TGT Science", "M.Sc., B.Ed.", "+91 98220 55441", "priya.k@school.edu.in", "48000"],
    staff: ["STF-201", "Ramesh Patil", "accountant", "Finance", "Senior Accountant", "+91 98220 55442", "ramesh.p@school.edu.in", "36000"],
    fees: ["ADM-2026-2001", "18500"],
  };
  return buildCsvText(TEMPLATE_HEADERS[entityType], [sampleRow[entityType]]);
}

export async function runBulkImportAction(formData: FormData): Promise<ActionResult<BulkImportResultDto>> {
  const auth = await requireSchoolAdmin();
  if (!auth.admin || auth.error || !auth.user) return { ok: false, error: auth.error ?? "Unauthorized" };

  const entityRaw = String(formData.get("entityType") ?? "students");
  const mode = String(formData.get("mode") ?? "dry_run");
  const file = formData.get("file");

  if (!["students", "guardians", "teachers", "staff", "fees"].includes(entityRaw)) {
    return { ok: false, error: "Invalid import entity type." };
  }
  const entityType = entityRaw as BulkImportResultDto["entityType"];

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Select a .csv or .xlsx spreadsheet file." };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const rows = parseSpreadsheetBuffer(file.name, buf);
  if (rows.length === 0) {
    return { ok: false, error: "Spreadsheet has no data rows beneath headers." };
  }
  if (rows.length > 10000) {
    return { ok: false, error: "Maximum 10,000 rows per batch upload." };
  }

  // Enforce plan limit for students / teachers
  const { data: usage } = await auth.admin.rpc("get_school_usage_summary", { p_school_id: auth.schoolId });
  const u = usage?.[0];

  const [classesRes, ayRes] = await Promise.all([
    auth.admin.from("school_classes").select("id, name, code").eq("school_id", auth.schoolId).is("deleted_at", null),
    auth.admin.from("academic_years").select("id").eq("school_id", auth.schoolId).eq("status", "Active").maybeSingle(),
  ]);

  const classMap = new Map<string, string>();
  for (const c of classesRes.data ?? []) {
    classMap.set(c.name.toLowerCase(), c.id);
    classMap.set(c.code.toLowerCase(), c.id);
  }
  const activeAyId = ayRes.data?.id ?? null;

  const rowErrors: Array<{ row: number; error: string }> = [];
  const preview: BulkImportPreviewRow[] = [];
  const validRows: Array<Record<string, string>> = [];

  rows.forEach((r, idx) => {
    const rowNum = idx + 2;
    let errMsg = "";
    let key = "";
    let label = "";
    let detail = "";

    if (entityType === "students") {
      key = (r.admission_no || "").toUpperCase();
      label = r.full_name || "";
      detail = `${r.class_name || "—"} ${r.section_name || "A"}`;
      if (!key) errMsg = "Missing admission_no";
      else if (label.length < 2) errMsg = "Missing full_name";
    } else if (entityType === "teachers" || entityType === "staff") {
      key = (r.employee_code || "").toUpperCase();
      label = r.full_name || "";
      detail = r.department || r.sub_role || entityType;
      if (!key) errMsg = "Missing employee_code";
      else if (label.length < 2) errMsg = "Missing full_name";
    } else if (entityType === "guardians") {
      key = r.phone || r.email || "";
      label = r.full_name || "";
      detail = r.student_admission_no || "Guardian";
      if (label.length < 2 || (!r.phone && !r.email)) errMsg = "Missing full_name or phone/email";
    } else {
      key = (r.admission_no || "").toUpperCase();
      label = key;
      detail = `Balance INR ${r.fee_balance_inr || "0"}`;
      if (!key || Number.isNaN(Number(r.fee_balance_inr))) errMsg = "Invalid admission_no or numeric fee_balance_inr";
    }

    if (errMsg) {
      rowErrors.push({ row: rowNum, error: errMsg });
      if (preview.length < 50) {
        preview.push({ rowNum, key, label: label || "—", detail, status: "Error", error: errMsg });
      }
    } else {
      validRows.push(r);
      if (preview.length < 50) {
        preview.push({ rowNum, key, label, detail, status: "Valid" });
      }
    }
  });

  if (mode === "dry_run") {
    return {
      ok: true,
      data: {
        entityType,
        totalRows: rows.length,
        validCount: validRows.length,
        errorCount: rowErrors.length,
        createdCount: 0,
        updatedCount: 0,
        preview,
        rowErrors: rowErrors.slice(0, 100),
      },
    };
  }

  if (entityType === "students" && u && Number(u.students_count) + validRows.length > Number(u.max_students)) {
    return {
      ok: false,
      error: `Import exceeds plan limit (${u.students_count}/${u.max_students} students). Ask EduCore Support to upgrade your student slab.`,
    };
  }

  let createdCount = 0;
  let updatedCount = 0;
  const CHUNK_SIZE = 500;

  for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
    const chunk = validRows.slice(i, i + CHUNK_SIZE);

    if (entityType === "students") {
      const payload = chunk.map((r) => {
        const clsName = (r.class_name || "").toLowerCase();
        const classId = classMap.get(clsName) ?? null;
        return {
          school_id: auth.schoolId,
          admission_no: r.admission_no.toUpperCase(),
          roll_no: r.roll_no || "",
          full_name: r.full_name,
          gender: ["Male", "Female", "Other"].includes(r.gender) ? r.gender : "Unspecified",
          dob: /^\d{4}-\d{2}-\d{2}$/.test(r.dob || "") ? r.dob : null,
          academic_year_id: activeAyId,
          class_id: classId,
          section_name: (r.section_name || "A").toUpperCase(),
          status: "Active",
          emergency_contact: r.guardian_phone || "",
        };
      });
      const { error } = await auth.admin
        .from("students")
        .upsert(payload, { onConflict: "school_id,admission_no" });
      if (error) return { ok: false, error: getErrorMessage(error, "Student chunk upsert failed.") };
      createdCount += chunk.length;
    } else if (entityType === "teachers" || entityType === "staff") {
      const payload = chunk.map((r) => ({
        school_id: auth.schoolId,
        employee_code: r.employee_code.toUpperCase(),
        full_name: r.full_name,
        category: entityType === "teachers" ? "Teacher" : "Staff",
        sub_role: entityType === "staff" ? r.sub_role || null : null,
        department: r.department || "General",
        designation: r.designation || (entityType === "teachers" ? "Faculty" : "Staff"),
        qualification: r.qualification || "",
        phone: r.phone || "",
        email: r.email || "",
        base_salary_inr: Number(r.base_salary_inr || 0),
        status: "Active",
      }));
      const { error } = await auth.admin
        .from("staff_members")
        .upsert(payload, { onConflict: "school_id,employee_code" });
      if (error) return { ok: false, error: getErrorMessage(error, "Staff chunk upsert failed.") };
      createdCount += chunk.length;
    } else if (entityType === "guardians") {
      const { error } = await auth.admin.from("guardians").insert(
        chunk.map((r) => ({
          school_id: auth.schoolId,
          full_name: r.full_name,
          relation: r.relation || "Parent",
          phone: r.phone || "",
          email: r.email || "",
          occupation: r.occupation || "",
        })),
      );
      if (error) return { ok: false, error: getErrorMessage(error, "Guardians insert failed.") };
      createdCount += chunk.length;
    } else {
      for (const r of chunk) {
        const { data: stu } = await auth.admin
          .from("students")
          .select("id")
          .eq("school_id", auth.schoolId)
          .eq("admission_no", r.admission_no.toUpperCase())
          .maybeSingle();
        if (stu) {
          await auth.admin
            .from("students")
            .update({ fee_balance_inr: Number(r.fee_balance_inr) })
            .eq("id", stu.id);
          updatedCount += 1;
        }
      }
    }
  }

  const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
  const { data: job } = await auth.admin
    .from("bulk_import_jobs")
    .insert({
      school_id: auth.schoolId,
      entity_type: entityType,
      file_name: file.name,
      idempotency_hash: hash,
      total_rows: rows.length,
      created_count: createdCount,
      updated_count: updatedCount,
      error_count: rowErrors.length,
      row_errors: rowErrors.slice(0, 200),
      status: "completed",
      created_by: auth.user.id,
    })
    .select("id")
    .single();

  if (entityType === "students" && createdCount > 0) {
    await auth.admin
      .from("school_onboarding")
      .upsert({ school_id: auth.schoolId, students_imported_done: true }, { onConflict: "school_id" });
  } else if (entityType === "teachers" && createdCount > 0) {
    await auth.admin
      .from("school_onboarding")
      .upsert({ school_id: auth.schoolId, teachers_imported_done: true }, { onConflict: "school_id" });
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/students/bulk-import");
  revalidatePath("/admin/teachers");

  return {
    ok: true,
    data: {
      jobId: job?.id,
      entityType,
      totalRows: rows.length,
      validCount: validRows.length,
      errorCount: rowErrors.length,
      createdCount,
      updatedCount,
      preview,
      rowErrors: rowErrors.slice(0, 100),
    },
  };
}

// ---------- C4: Bulk Credential Generation per Class / Category ----------

export async function generateBulkCredentialsAction(params: {
  targetType: "student" | "teacher" | "staff";
  classId?: string;
}): Promise<ActionResult<{ slips: GeneratedCredentialSlip[]; csvText: string }>> {
  const auth = await requireSchoolAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const slips: GeneratedCredentialSlip[] = [];

  if (params.targetType === "student") {
    let q = auth.admin
      .from("students")
      .select("id, admission_no, full_name, section_name, profile_id, school_classes(name)")
      .eq("school_id", auth.schoolId)
      .is("deleted_at", null)
      .is("profile_id", null)
      .limit(100);
    if (params.classId) q = q.eq("class_id", params.classId);
    const { data: unlinked } = await q;

    for (const st of unlinked ?? []) {
      const loginId = st.admission_no;
      const email = `${loginId.toLowerCase().replace(/[^a-z0-9]/g, "")}.${auth.schoolCode.toLowerCase()}@student.educore.local`;
      const tempPassword = `Edu#${crypto.randomBytes(5).toString("base64url")}9`;
      const created = await auth.admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        app_metadata: {
          role: "student",
          school_id: auth.schoolId,
          user_code: loginId,
          full_name: st.full_name,
          subtitle: "Student",
        },
        user_metadata: { full_name: st.full_name },
      });
      if (created.data.user) {
        await auth.admin.from("profiles").upsert(
          {
            id: created.data.user.id,
            school_id: auth.schoolId,
            user_code: loginId,
            email,
            full_name: st.full_name,
            role: "student",
            initials: st.full_name.slice(0, 2).toUpperCase(),
            subtitle: "Student",
            status: "Active",
            must_change_password: true,
          },
          { onConflict: "id" },
        );
        await auth.admin.from("students").update({ profile_id: created.data.user.id }).eq("id", st.id);
        const clsObj = Array.isArray(st.school_classes) ? st.school_classes[0] : st.school_classes;
        slips.push({
          entityType: "student",
          loginId,
          fullName: st.full_name,
          email,
          classLabel: `${clsObj?.name ?? "Class"} - ${st.section_name}`,
          tempPassword,
        });
      }
    }
  } else {
    const category = params.targetType === "teacher" ? "Teacher" : "Staff";
    const { data: unlinked } = await auth.admin
      .from("staff_members")
      .select("id, employee_code, full_name, department, email, sub_role, profile_id")
      .eq("school_id", auth.schoolId)
      .eq("category", category)
      .is("deleted_at", null)
      .is("profile_id", null)
      .limit(100);

    for (const sm of unlinked ?? []) {
      const loginId = sm.employee_code;
      const email = sm.email?.includes("@")
        ? sm.email.toLowerCase()
        : `${loginId.toLowerCase().replace(/[^a-z0-9]/g, "")}.${auth.schoolCode.toLowerCase()}@staff.educore.local`;
      const tempPassword = `Edu#${crypto.randomBytes(5).toString("base64url")}9`;
      const role = params.targetType === "teacher" ? "teacher" : "staff";
      const created = await auth.admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        app_metadata: {
          role,
          sub_role: sm.sub_role ?? undefined,
          school_id: auth.schoolId,
          user_code: loginId,
          full_name: sm.full_name,
          subtitle: sm.department,
        },
        user_metadata: { full_name: sm.full_name },
      });
      if (created.data.user) {
        await auth.admin.from("profiles").upsert(
          {
            id: created.data.user.id,
            school_id: auth.schoolId,
            user_code: loginId,
            email,
            full_name: sm.full_name,
            role,
            sub_role: sm.sub_role,
            initials: sm.full_name.slice(0, 2).toUpperCase(),
            subtitle: sm.department,
            status: "Active",
            must_change_password: true,
          },
          { onConflict: "id" },
        );
        await auth.admin.from("staff_members").update({ profile_id: created.data.user.id }).eq("id", sm.id);
        slips.push({
          entityType: params.targetType,
          loginId,
          fullName: sm.full_name,
          email,
          classLabel: sm.department,
          tempPassword,
        });
      }
    }
  }

  const csvText = buildCsvText(
    ["School Code", "Role", "Login ID", "Full Name", "Class / Dept", "Email", "Temporary Password (Shown Once)"],
    slips.map((s) => [auth.schoolCode, s.entityType, s.loginId, s.fullName, s.classLabel, s.email, s.tempPassword]),
  );

  revalidatePath("/admin/setup/credentials");
  revalidatePath("/admin/setup/users");
  return { ok: true, data: { slips, csvText } };
}

// ---------- C5: Academic Year Rollover Preview & Execution ----------

export async function getRolloverContextAction(): Promise<
  ActionResult<{
    years: Array<{ id: string; name: string; status: string }>;
    classes: Array<{ id: string; name: string }>;
    students: RolloverCandidateDto[];
  }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const [yearsRes, clsRes, stuRes] = await Promise.all([
    supabase.from("academic_years").select("id, name, status").is("deleted_at", null).order("start_date", { ascending: false }),
    supabase.from("school_classes").select("id, name").is("deleted_at", null).order("grade_order", { ascending: true }),
    supabase
      .from("students")
      .select("id, admission_no, roll_no, full_name, class_id, section_name, fee_balance_inr, school_classes(name)")
      .eq("status", "Active")
      .is("deleted_at", null)
      .order("full_name", { ascending: true })
      .limit(200),
  ]);

  return {
    ok: true,
    data: {
      years: yearsRes.data ?? [],
      classes: clsRes.data ?? [],
      students: (stuRes.data ?? []).map((s) => {
        const clsObj = Array.isArray(s.school_classes) ? s.school_classes[0] : s.school_classes;
        return {
          studentId: s.id,
          admissionNo: s.admission_no,
          rollNo: s.roll_no,
          fullName: s.full_name,
          currentClassId: s.class_id,
          currentClassName: clsObj?.name ?? "Unassigned",
          currentSection: s.section_name,
          feeBalanceInr: Number(s.fee_balance_inr ?? 0),
          defaultAction: "Promote",
        };
      }),
    },
  };
}

const rolloverSchema = z.object({
  fromAcademicYearId: z.string().uuid(),
  toAcademicYearId: z.string().uuid(),
  targetClassId: z.string().uuid(),
  targetSection: z.string().min(1).default("A"),
  archiveSourceYear: z.boolean().default(true),
  decisions: z.array(
    z.object({
      studentId: z.string().uuid(),
      action: z.enum(["Promote", "Detain", "Transfer"]),
      currentClassId: z.string().uuid().nullable(),
      feeBalanceInr: z.number(),
    }),
  ),
});

export async function executeAcademicYearRolloverAction(
  raw: z.input<typeof rolloverSchema>,
): Promise<ActionResult<{ processed: number }>> {
  const auth = await requireSchoolAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const parsed = rolloverSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid rollover data." };
  const d = parsed.data;

  for (const item of d.decisions) {
    if (item.action === "Transfer") {
      await auth.admin
        .from("students")
        .update({ status: "Transferred" })
        .eq("id", item.studentId)
        .eq("school_id", auth.schoolId);
      await auth.admin
        .from("student_enrollments")
        .update({ promotion_status: "Transferred", is_read_only: true })
        .eq("student_id", item.studentId)
        .eq("academic_year_id", d.fromAcademicYearId);
    } else {
      const nextClassId = item.action === "Promote" ? d.targetClassId : item.currentClassId;
      await auth.admin
        .from("students")
        .update({
          academic_year_id: d.toAcademicYearId,
          class_id: nextClassId,
          section_name: d.targetSection,
          status: item.action === "Detain" ? "Detained" : "Active",
        })
        .eq("id", item.studentId)
        .eq("school_id", auth.schoolId);

      await auth.admin
        .from("student_enrollments")
        .update({
          promotion_status: item.action === "Promote" ? "Promoted" : "Detained",
          is_read_only: true,
        })
        .eq("student_id", item.studentId)
        .eq("academic_year_id", d.fromAcademicYearId);

      await auth.admin.from("student_enrollments").upsert(
        {
          school_id: auth.schoolId,
          student_id: item.studentId,
          academic_year_id: d.toAcademicYearId,
          class_id: nextClassId,
          section_name: d.targetSection,
          promotion_status: "Active",
          carried_fee_balance_inr: item.feeBalanceInr,
        },
        { onConflict: "school_id,student_id,academic_year_id" },
      );
    }
  }

  if (d.archiveSourceYear && d.fromAcademicYearId !== d.toAcademicYearId) {
    await Promise.all([
      auth.admin
        .from("academic_years")
        .update({ status: "Archived" })
        .eq("id", d.fromAcademicYearId)
        .eq("school_id", auth.schoolId),
      auth.admin
        .from("academic_years")
        .update({ status: "Active" })
        .eq("id", d.toAcademicYearId)
        .eq("school_id", auth.schoolId),
    ]);
  }

  revalidatePath("/admin/students/promotion");
  revalidatePath("/admin/students");
  revalidatePath("/admin/setup/academic-years");
  return { ok: true, data: { processed: d.decisions.length } };
}
