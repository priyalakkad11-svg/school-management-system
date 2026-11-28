"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getErrorMessage } from "@/lib/errors";
import { applyTableQuery, toPaginatedResult, type PaginatedResult, type TableQueryParams } from "@/lib/query";
import { schoolProfileSchema } from "@/schemas/domain";
import type { ActionResult } from "@/app/actions/auth.actions";
import type {
  AcademicYear,
  AdminUser,
  SchoolClass,
  Subject,
  UserRole,
} from "@/types/domain";

export interface SchoolSettingsDto {
  id: string;
  schoolName: string;
  affiliationCode: string;
  principalName: string;
  officialEmail: string;
  phone: string;
  timezoneCurrency: string;
  address: string;
  gradingMode: string;
  logoPath: string | null;
  logoSignedUrl: string | null;
}

export interface SubjectMappingRowDto {
  subjectId: string;
  subject: string;
  code: string;
  periodsPerWeek: number;
  category: string;
  isMandatory: boolean;
  mapped: boolean;
}

export interface SubjectMappingContextDto {
  academicYears: { id: string; name: string; status: string }[];
  classes: { id: string; name: string }[];
  selectedYearId: string;
  selectedClassId: string;
  rows: SubjectMappingRowDto[];
}

export interface RbacPermissionDto {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  del: boolean;
  exp: boolean;
}

export interface RbacRoleDto {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: RbacPermissionDto[];
}

const DEFAULT_RBAC_MODULES = [
  "Fees & Receipts",
  "Payroll & Salary Slips",
  "Student Directory",
  "Exams & Marks",
  "Attendance & Timetable",
  "Communication & Notices",
];

const academicYearCreateSchema = z.object({
  name: z.string().trim().min(3, "Session name is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD start date"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD end date"),
});

const classUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Class name is required"),
  gradeOrder: z.coerce.number().int().min(1).max(12),
  wing: z.string().trim().min(2, "Wing is required"),
  sections: z.string().trim().min(1, "At least one section is required"),
  capacity: z.coerce.number().int().min(10).max(240),
  roomBlock: z.string().trim().min(2, "Room block is required"),
  classTeachers: z.string().trim().default(""),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

const subjectUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Subject name is required"),
  code: z.string().trim().min(2, "Subject code is required"),
  category: z.string().trim().min(2, "Category is required"),
  maxTheory: z.coerce.number().int().min(0).max(100),
  maxPractical: z.coerce.number().int().min(0).max(100),
  periodsPerWeek: z.coerce.number().int().min(1).max(20).default(4),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

const saveMappingsSchema = z.object({
  academicYearId: z.string().uuid(),
  classId: z.string().uuid(),
  items: z.array(
    z.object({
      subjectId: z.string().uuid(),
      periodsPerWeek: z.coerce.number().int().min(1).max(20),
      isMandatory: z.boolean(),
      mapped: z.boolean(),
    }),
  ),
});

const saveRbacSchema = z.object({
  roleId: z.string().uuid(),
  permissions: z.array(
    z.object({
      module: z.string().min(2),
      view: z.boolean(),
      create: z.boolean(),
      edit: z.boolean(),
      del: z.boolean(),
      exp: z.boolean(),
    }),
  ),
});

const createRoleSchema = z.object({
  name: z.string().trim().min(2, "Role name is required").max(60),
  description: z.string().trim().max(200).optional(),
});

const inviteUserSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  roleLabel: z.string().trim().min(2, "Role label is required"),
  portalRole: z.enum(["admin", "staff", "teacher"]).default("staff"),
});

async function requireAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase: null, user: null, error: "Please sign in as an administrator." };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, status, deleted_at")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || profile.status !== "Active") {
    return { supabase: null, user: null, error: "Administrator privileges required." };
  }
  return { supabase, user, error: null };
}

function formatDateLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function slugCode(prefix: string, raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${prefix}-${cleaned || Date.now()}`;
}

// ---------- 08. School Profile & Institutional Settings ----------

export async function getSchoolSettingsAction(): Promise<ActionResult<SchoolSettingsDto>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Authentication required." };
  }

  const { data, error } = await supabase
    .from("school_settings")
    .select("*")
    .eq("singleton_key", "default")
    .maybeSingle();

  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to load school settings.") };
  }
  if (!data) {
    return { ok: false, error: "School profile has not been initialized yet." };
  }

  let logoSignedUrl: string | null = null;
  if (data.logo_path) {
    const admin = createAdminClient();
    const signed = await admin.storage.from("documents").createSignedUrl(data.logo_path, 3600);
    logoSignedUrl = signed.data?.signedUrl ?? null;
  }

  return {
    ok: true,
    data: {
      id: data.id,
      schoolName: data.school_name,
      affiliationCode: data.affiliation_code,
      principalName: data.principal_name,
      officialEmail: data.official_email,
      phone: data.phone,
      timezoneCurrency: data.timezone_currency,
      address: data.address,
      gradingMode: data.grading_mode,
      logoPath: data.logo_path,
      logoSignedUrl,
    },
  };
}

export async function saveSchoolSettingsAction(
  raw: z.input<typeof schoolProfileSchema>,
): Promise<ActionResult<SchoolSettingsDto>> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const parsed = schoolProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid school profile details." };
  }

  const { data, error } = await auth.supabase
    .from("school_settings")
    .upsert(
      {
        singleton_key: "default",
        school_name: parsed.data.schoolName,
        affiliation_code: parsed.data.affiliationCode,
        principal_name: parsed.data.principalName,
        official_email: parsed.data.officialEmail,
        phone: parsed.data.phone,
        timezone_currency: parsed.data.timezoneCurrency,
        address: parsed.data.address,
        grading_mode: parsed.data.gradingMode,
      },
      { onConflict: "singleton_key" },
    )
    .select("*")
    .single();

  if (error || !data) {
    return { ok: false, error: getErrorMessage(error, "Unable to save school profile.") };
  }

  revalidatePath("/admin/setup/school-profile");
  return {
    ok: true,
    data: {
      id: data.id,
      schoolName: data.school_name,
      affiliationCode: data.affiliation_code,
      principalName: data.principal_name,
      officialEmail: data.official_email,
      phone: data.phone,
      timezoneCurrency: data.timezone_currency,
      address: data.address,
      gradingMode: data.grading_mode,
      logoPath: data.logo_path,
      logoSignedUrl: null,
    },
  };
}

export async function uploadSchoolLogoAction(
  formData: FormData,
): Promise<ActionResult<{ logoPath: string; signedUrl: string | null }>> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a PNG, JPEG, or PDF file to upload." };
  }
  const allowed = new Set(["image/png", "image/jpeg", "application/pdf"]);
  if (!allowed.has(file.type)) {
    return { ok: false, error: "Only PNG, JPEG, or PDF files are accepted." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "File exceeds 5 MB limit." };
  }

  const ext = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
  const path = `school/crest-${Date.now()}.${ext}`;
  const admin = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadErr } = await admin.storage
    .from("documents")
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadErr) {
    return { ok: false, error: getErrorMessage(uploadErr, "Logo upload failed.") };
  }

  const { error: updateErr } = await auth.supabase
    .from("school_settings")
    .update({ logo_path: path })
    .eq("singleton_key", "default");

  if (updateErr) {
    return { ok: false, error: getErrorMessage(updateErr, "Unable to attach uploaded logo.") };
  }

  const signed = await admin.storage.from("documents").createSignedUrl(path, 3600);
  revalidatePath("/admin/setup/school-profile");
  return {
    ok: true,
    data: { logoPath: path, signedUrl: signed.data?.signedUrl ?? null },
  };
}

// ---------- 09. Academic Year Management ----------

export async function listAcademicYearsAction(
  params?: TableQueryParams,
): Promise<ActionResult<PaginatedResult<AcademicYear>>> {
  const supabase = await createClient();
  const baseQuery = supabase
    .from("academic_years")
    .select("*", { count: "exact" })
    .is("deleted_at", null);

  const { query, page, pageSize } = applyTableQuery(baseQuery, params, {
    searchColumns: ["name", "code", "start_label", "end_label"],
    allowedSortColumns: {
      name: "name",
      start: "start_date",
      end: "end_date",
      students: "students_count",
      status: "status",
    },
    defaultSortColumn: "start_date",
    defaultSortDir: "desc",
    filterColumnMap: { status: "status" },
  });

  const { data, count, error } = await query;
  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to load academic years.") };
  }

  const rows: AcademicYear[] = (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    startDate: r.start_label,
    endDate: r.end_label,
    studentsCount: r.students_count,
    status: (r.status as AcademicYear["status"]) ?? "Upcoming",
  }));

  return { ok: true, data: toPaginatedResult(rows, count, page, pageSize) };
}

export async function createAcademicYearAction(
  raw: z.input<typeof academicYearCreateSchema>,
): Promise<ActionResult<AcademicYear>> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const parsed = academicYearCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid academic year data." };
  }
  if (parsed.data.endDate <= parsed.data.startDate) {
    return { ok: false, error: "End date must be after start date." };
  }

  const { data, error } = await auth.supabase
    .from("academic_years")
    .insert({
      code: slugCode("AY", `${parsed.data.startDate.slice(0, 4)}-${parsed.data.endDate.slice(2, 4)}`),
      name: parsed.data.name,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      start_label: formatDateLabel(parsed.data.startDate),
      end_label: formatDateLabel(parsed.data.endDate),
      students_count: 0,
      status: "Upcoming",
    })
    .select("*")
    .single();

  if (error || !data) {
    return { ok: false, error: getErrorMessage(error, "Unable to create academic year.") };
  }

  revalidatePath("/admin/setup/academic-years");
  return {
    ok: true,
    data: {
      id: data.id,
      name: data.name,
      startDate: data.start_label,
      endDate: data.end_label,
      studentsCount: data.students_count,
      status: data.status as AcademicYear["status"],
    },
  };
}

export async function setActiveAcademicYearAction(id: string): Promise<ActionResult> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  await auth.supabase
    .from("academic_years")
    .update({ status: "Archived" })
    .eq("status", "Active")
    .is("deleted_at", null);

  const { error } = await auth.supabase
    .from("academic_years")
    .update({ status: "Active" })
    .eq("id", id);

  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to activate session.") };
  }

  revalidatePath("/admin/setup/academic-years");
  return { ok: true };
}

export async function deleteAcademicYearAction(id: string): Promise<ActionResult> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { data: target } = await auth.supabase
    .from("academic_years")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (target?.status === "Active") {
    return { ok: false, error: "Activate another academic year before archiving this session." };
  }

  const { error } = await auth.supabase
    .from("academic_years")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to delete academic year.") };
  }

  revalidatePath("/admin/setup/academic-years");
  return { ok: true };
}

// ---------- 10 & 11. Classes & Sections ----------

export async function listClassesAction(
  params?: TableQueryParams,
): Promise<ActionResult<PaginatedResult<SchoolClass>>> {
  const supabase = await createClient();
  const baseQuery = supabase
    .from("school_classes")
    .select("*", { count: "exact" })
    .is("deleted_at", null);

  const { query, page, pageSize } = applyTableQuery(baseQuery, params, {
    searchColumns: ["name", "code", "wing", "room_block", "class_teachers"],
    allowedSortColumns: {
      name: "grade_order",
      teachers: "class_teachers",
      strength: "strength",
      room: "room_block",
      status: "status",
    },
    defaultSortColumn: "grade_order",
    defaultSortDir: "desc",
    filterColumnMap: { wing: "wing", status: "status" },
  });

  const { data, count, error } = await query;
  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to load classes.") };
  }

  const rows: SchoolClass[] = (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    gradeOrder: r.grade_order,
    wing: r.wing,
    sections: r.sections,
    classTeachers: r.class_teachers,
    strength: r.strength,
    capacity: r.capacity,
    roomBlock: r.room_block,
    status: (r.status as SchoolClass["status"]) ?? "Active",
  }));

  return { ok: true, data: toPaginatedResult(rows, count, page, pageSize) };
}

export async function getClassByIdAction(id: string): Promise<ActionResult<SchoolClass | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("school_classes")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to fetch class details.") };
  }
  if (!data) return { ok: true, data: null };

  return {
    ok: true,
    data: {
      id: data.id,
      name: data.name,
      gradeOrder: data.grade_order,
      wing: data.wing,
      sections: data.sections,
      classTeachers: data.class_teachers,
      strength: data.strength,
      capacity: data.capacity,
      roomBlock: data.room_block,
      status: (data.status as SchoolClass["status"]) ?? "Active",
    },
  };
}

export async function upsertClassSectionAction(
  raw: z.input<typeof classUpsertSchema>,
): Promise<ActionResult<SchoolClass>> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const parsed = classUpsertSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid class details." };
  }

  const sections = parsed.data.sections
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (sections.length === 0) {
    return { ok: false, error: "Provide at least one section letter (e.g. A, B)." };
  }

  const payload = {
    code: slugCode("CLS", parsed.data.name),
    name: parsed.data.name,
    grade_order: parsed.data.gradeOrder,
    wing: parsed.data.wing,
    sections,
    class_teachers: parsed.data.classTeachers,
    capacity: parsed.data.capacity,
    room_block: parsed.data.roomBlock,
    status: parsed.data.status,
  };

  const query = parsed.data.id
    ? auth.supabase.from("school_classes").update(payload).eq("id", parsed.data.id).select("*").single()
    : auth.supabase.from("school_classes").insert(payload).select("*").single();

  const { data, error } = await query;
  if (error || !data) {
    return { ok: false, error: getErrorMessage(error, "Unable to save class & sections.") };
  }

  revalidatePath("/admin/setup/classes");
  revalidatePath("/admin/setup/classes/manage");
  return {
    ok: true,
    data: {
      id: data.id,
      name: data.name,
      gradeOrder: data.grade_order,
      wing: data.wing,
      sections: data.sections,
      classTeachers: data.class_teachers,
      strength: data.strength,
      capacity: data.capacity,
      roomBlock: data.room_block,
      status: data.status as SchoolClass["status"],
    },
  };
}

// ---------- 12. Subjects Catalog ----------

export async function listSubjectsAction(): Promise<ActionResult<Subject[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .is("deleted_at", null)
    .order("code", { ascending: true });

  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to load subjects.") };
  }

  return {
    ok: true,
    data: (data ?? []).map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      category: r.category,
      maxTheory: r.max_theory,
      maxPractical: r.max_practical,
      periodsPerWeek: r.periods_per_week,
      status: (r.status as Subject["status"]) ?? "Active",
    })),
  };
}

export async function upsertSubjectAction(
  raw: z.input<typeof subjectUpsertSchema>,
): Promise<ActionResult<Subject>> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const parsed = subjectUpsertSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid subject input." };
  }

  const payload = {
    code: parsed.data.code.toUpperCase(),
    name: parsed.data.name,
    category: parsed.data.category,
    max_theory: parsed.data.maxTheory,
    max_practical: parsed.data.maxPractical,
    periods_per_week: parsed.data.periodsPerWeek,
    status: parsed.data.status,
  };

  const query = parsed.data.id
    ? auth.supabase.from("subjects").update(payload).eq("id", parsed.data.id).select("*").single()
    : auth.supabase
        .from("subjects")
        .upsert(payload, { onConflict: "code" })
        .select("*")
        .single();

  const { data, error } = await query;
  if (error || !data) {
    return { ok: false, error: getErrorMessage(error, "Unable to save subject.") };
  }

  revalidatePath("/admin/setup/subjects");
  revalidatePath("/academics");
  return {
    ok: true,
    data: {
      id: data.id,
      code: data.code,
      name: data.name,
      category: data.category,
      maxTheory: data.max_theory,
      maxPractical: data.max_practical,
      periodsPerWeek: data.periods_per_week,
      status: data.status as Subject["status"],
    },
  };
}

export async function deleteSubjectAction(id: string): Promise<ActionResult> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { error } = await auth.supabase
    .from("subjects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to remove subject.") };
  }

  revalidatePath("/admin/setup/subjects");
  revalidatePath("/academics");
  return { ok: true };
}

// ---------- 13. Subject-Class Mapping ----------

export async function getSubjectMappingContextAction(params?: {
  academicYearId?: string;
  classId?: string;
}): Promise<ActionResult<SubjectMappingContextDto>> {
  const supabase = await createClient();

  const [yearsRes, classesRes, subjectsRes] = await Promise.all([
    supabase
      .from("academic_years")
      .select("id, name, status")
      .is("deleted_at", null)
      .order("start_date", { ascending: false }),
    supabase
      .from("school_classes")
      .select("id, name, grade_order")
      .is("deleted_at", null)
      .order("grade_order", { ascending: false }),
    supabase
      .from("subjects")
      .select("id, name, code, periods_per_week, category")
      .is("deleted_at", null)
      .order("code", { ascending: true }),
  ]);

  if (yearsRes.error || classesRes.error || subjectsRes.error) {
    return {
      ok: false,
      error: getErrorMessage(
        yearsRes.error ?? classesRes.error ?? subjectsRes.error,
        "Unable to load curriculum mapping data.",
      ),
    };
  }

  const academicYears = yearsRes.data ?? [];
  const classes = classesRes.data ?? [];
  const subjects = subjectsRes.data ?? [];

  const selectedYearId =
    params?.academicYearId && academicYears.some((y) => y.id === params.academicYearId)
      ? params.academicYearId
      : academicYears.find((y) => y.status === "Active")?.id ?? academicYears[0]?.id ?? "";

  const selectedClassId =
    params?.classId && classes.some((c) => c.id === params.classId)
      ? params.classId
      : classes[0]?.id ?? "";

  let existingMap = new Map<string, { periods: number; isMandatory: boolean; mapped: boolean }>();
  if (selectedYearId && selectedClassId) {
    const mapRes = await supabase
      .from("class_subject_mappings")
      .select("subject_id, periods_per_week, is_mandatory, mapped")
      .eq("academic_year_id", selectedYearId)
      .eq("class_id", selectedClassId);
    if (mapRes.data) {
      existingMap = new Map(
        mapRes.data.map((m) => [
          m.subject_id,
          { periods: m.periods_per_week, isMandatory: m.is_mandatory, mapped: m.mapped },
        ]),
      );
    }
  }

  const rows: SubjectMappingRowDto[] = subjects.map((s) => {
    const existing = existingMap.get(s.id);
    return {
      subjectId: s.id,
      subject: s.name,
      code: s.code,
      periodsPerWeek: existing?.periods ?? s.periods_per_week,
      category: s.category,
      isMandatory: existing?.isMandatory ?? !s.category.toLowerCase().includes("elective"),
      mapped: existing?.mapped ?? false,
    };
  });

  return {
    ok: true,
    data: {
      academicYears,
      classes: classes.map((c) => ({ id: c.id, name: c.name })),
      selectedYearId,
      selectedClassId,
      rows,
    },
  };
}

export async function saveSubjectMappingsAction(
  raw: z.input<typeof saveMappingsSchema>,
): Promise<ActionResult> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const parsed = saveMappingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid curriculum mapping." };
  }

  const rows = parsed.data.items.map((item) => ({
    academic_year_id: parsed.data.academicYearId,
    class_id: parsed.data.classId,
    subject_id: item.subjectId,
    periods_per_week: item.periodsPerWeek,
    is_mandatory: item.isMandatory,
    mapped: item.mapped,
  }));

  const { error } = await auth.supabase
    .from("class_subject_mappings")
    .upsert(rows, { onConflict: "academic_year_id,class_id,subject_id" });

  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to save subject mapping.") };
  }

  revalidatePath("/admin/setup/subject-mapping");
  return { ok: true };
}

// ---------- 14. RBAC Roles & Permissions ----------

export async function listRbacRolesAction(): Promise<ActionResult<RbacRoleDto[]>> {
  const supabase = await createClient();
  const [rolesRes, permsRes] = await Promise.all([
    supabase.from("rbac_roles").select("*").order("name", { ascending: true }),
    supabase.from("rbac_permissions").select("*").order("module", { ascending: true }),
  ]);

  if (rolesRes.error || permsRes.error) {
    return {
      ok: false,
      error: getErrorMessage(rolesRes.error ?? permsRes.error, "Unable to load RBAC roles."),
    };
  }

  const permsByRole = new Map<string, RbacPermissionDto[]>();
  for (const p of permsRes.data ?? []) {
    const list = permsByRole.get(p.role_id) ?? [];
    list.push({
      module: p.module,
      view: p.can_view,
      create: p.can_create,
      edit: p.can_edit,
      del: p.can_delete,
      exp: p.can_export,
    });
    permsByRole.set(p.role_id, list);
  }

  const result: RbacRoleDto[] = (rolesRes.data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    isSystem: r.is_system,
    permissions: permsByRole.get(r.id) ?? [],
  }));

  return { ok: true, data: result };
}

export async function saveRolePermissionsAction(
  raw: z.input<typeof saveRbacSchema>,
): Promise<ActionResult> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const parsed = saveRbacSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid permission payload." };
  }

  const payload = parsed.data.permissions.map((p) => ({
    role_id: parsed.data.roleId,
    module: p.module,
    can_view: p.view,
    can_create: p.create,
    can_edit: p.edit,
    can_delete: p.del,
    can_export: p.exp,
  }));

  const { error } = await auth.supabase
    .from("rbac_permissions")
    .upsert(payload, { onConflict: "role_id,module" });

  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to save RBAC permissions.") };
  }

  revalidatePath("/admin/setup/roles");
  return { ok: true };
}

export async function createCustomRoleAction(
  raw: z.input<typeof createRoleSchema>,
): Promise<ActionResult<RbacRoleDto>> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const parsed = createRoleSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid role name." };
  }

  const { data: roleRow, error: roleErr } = await auth.supabase
    .from("rbac_roles")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description ?? "Custom school staff role",
      is_system: false,
    })
    .select("*")
    .single();

  if (roleErr || !roleRow) {
    return { ok: false, error: getErrorMessage(roleErr, "Unable to create custom role.") };
  }

  const seedPerms = DEFAULT_RBAC_MODULES.map((module) => ({
    role_id: roleRow.id,
    module,
    can_view: true,
    can_create: false,
    can_edit: false,
    can_delete: false,
    can_export: false,
  }));

  const { error: permErr } = await auth.supabase.from("rbac_permissions").insert(seedPerms);
  if (permErr) {
    return { ok: false, error: getErrorMessage(permErr, "Role created, but permissions failed.") };
  }

  revalidatePath("/admin/setup/roles");
  return {
    ok: true,
    data: {
      id: roleRow.id,
      name: roleRow.name,
      description: roleRow.description,
      isSystem: roleRow.is_system,
      permissions: seedPerms.map((p) => ({
        module: p.module,
        view: p.can_view,
        create: p.can_create,
        edit: p.can_edit,
        del: p.can_delete,
        exp: p.can_export,
      })),
    },
  };
}

// ---------- 15. Portal Users Management ----------

export async function listPortalUsersAction(
  params?: TableQueryParams,
): Promise<ActionResult<PaginatedResult<AdminUser>>> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const baseQuery = auth.supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .is("deleted_at", null);

  const { query, page, pageSize } = applyTableQuery(baseQuery, params, {
    searchColumns: ["full_name", "email", "user_code", "subtitle"],
    allowedSortColumns: {
      name: "full_name",
      email: "email",
      role: "role",
      lastLogin: "last_login_at",
      status: "status",
    },
    defaultSortColumn: "created_at",
    defaultSortDir: "desc",
    filterColumnMap: { role: "role", status: "status" },
  });

  const { data, count, error } = await query;
  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to fetch portal users.") };
  }

  const rows: AdminUser[] = (data ?? []).map((u) => ({
    id: u.id,
    name: u.full_name,
    email: u.email,
    role: u.subtitle || u.role.toUpperCase(),
    lastLogin: u.last_login_at
      ? new Date(u.last_login_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
      : "Pending first login",
    twoFactor: u.two_factor_enabled,
    status: u.status,
  }));

  return { ok: true, data: toPaginatedResult(rows, count, page, pageSize) };
}

export async function invitePortalUserAction(
  raw: z.input<typeof inviteUserSchema>,
): Promise<ActionResult<{ user: AdminUser; tempPassword: string }>> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const parsed = inviteUserSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid user details." };
  }

  const admin = createAdminClient();
  const tempPassword = `Edu#${crypto.randomBytes(6).toString("base64url")}9`;
  const userCode = `USR-${Math.floor(1000 + Math.random() * 8999)}`;
  const initials =
    parsed.data.fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") || "EC";

  const created = await admin.auth.admin.createUser({
    email: parsed.data.email.toLowerCase(),
    password: tempPassword,
    email_confirm: true,
    app_metadata: {
      role: parsed.data.portalRole as UserRole,
      user_code: userCode,
      full_name: parsed.data.fullName,
      subtitle: parsed.data.roleLabel,
    },
    user_metadata: { full_name: parsed.data.fullName },
  });

  if (created.error || !created.data.user) {
    return { ok: false, error: getErrorMessage(created.error, "Unable to create portal user.") };
  }

  const { error: upsertErr } = await admin.from("profiles").upsert(
    {
      id: created.data.user.id,
      user_code: userCode,
      email: parsed.data.email.toLowerCase(),
      full_name: parsed.data.fullName,
      role: parsed.data.portalRole,
      initials,
      subtitle: parsed.data.roleLabel,
      status: "Active",
      must_change_password: true,
    },
    { onConflict: "id" },
  );

  if (upsertErr) {
    return { ok: false, error: getErrorMessage(upsertErr, "User created, but profile failed.") };
  }

  revalidatePath("/admin/setup/users");
  return {
    ok: true,
    data: {
      user: {
        id: created.data.user.id,
        name: parsed.data.fullName,
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.roleLabel,
        lastLogin: "Invited just now",
        twoFactor: false,
        status: "Active",
      },
      tempPassword,
    },
  };
}

export async function togglePortalUserStatusAction(params: {
  userId: string;
  nextStatus: "Active" | "Suspended";
}): Promise<ActionResult> {
  const auth = await requireAdminSession();
  if (!auth.supabase || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  if (auth.user?.id === params.userId && params.nextStatus === "Suspended") {
    return { ok: false, error: "You cannot suspend your own active admin account." };
  }

  const { error } = await auth.supabase
    .from("profiles")
    .update({ status: params.nextStatus })
    .eq("id", params.userId);

  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to update account status.") };
  }

  revalidatePath("/admin/setup/users");
  return { ok: true };
}
