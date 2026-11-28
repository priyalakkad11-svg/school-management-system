"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_SCHOOL_ID } from "@/lib/auth";
import { checkAndConsumeRateLimit } from "@/lib/rate-limit";
import { dispatchCommunication } from "@/lib/comms-adapter";
import { getErrorMessage } from "@/lib/errors";
import { getTenantSession, requireTenantWrite } from "@/lib/tenant-context";
import type { ActionResult } from "@/app/actions/auth.actions";

// ---------- D3: Students, Guardians & Public Admissions Enquiry ----------

const publicEnquirySchema = z.object({
  schoolCode: z.string().trim().optional(),
  applicantName: z.string().trim().min(2, "Student name required"),
  parentName: z.string().trim().min(2, "Parent / Guardian name required"),
  phone: z.string().trim().min(8, "Valid contact phone required"),
  email: z.string().trim().email("Valid email required").or(z.literal("")).optional(),
  applyingGrade: z.string().trim().min(1, "Select grade applying for"),
  notes: z.string().trim().max(500).optional(),
  website: z.string().optional(), // Honeypot field
});

export async function submitPublicEnquiryAction(
  raw: z.input<typeof publicEnquirySchema>,
): Promise<ActionResult<{ enquiryNo: string }>> {
  const parsed = publicEnquirySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid admission enquiry." };
  }

  // Honeypot anti-bot trap: silently succeed without saving bot spam
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return { ok: true, data: { enquiryNo: "ENQ-RECEIVED" } };
  }

  const rate = await checkAndConsumeRateLimit({
    bucketKey: `enquiry:${parsed.data.phone.replace(/\D/g, "").slice(-10) || "anon"}`,
    maxAttempts: 5,
    windowMinutes: 60,
    lockMinutes: 60,
  });
  if (!rate.allowed) {
    return { ok: false, error: "Too many enquiries submitted recently. Please call the school office." };
  }

  const admin = createAdminClient();
  let schoolId = DEMO_SCHOOL_ID;
  if (parsed.data.schoolCode?.trim()) {
    const { data: sch } = await admin
      .from("schools")
      .select("id")
      .eq("school_code", parsed.data.schoolCode.trim().toUpperCase())
      .is("deleted_at", null)
      .maybeSingle();
    if (sch) schoolId = sch.id;
  }

  const enquiryNo = `ENQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 8999)}`;
  const { error } = await admin.from("admission_enquiries").insert({
    school_id: schoolId,
    enquiry_no: enquiryNo,
    applicant_name: parsed.data.applicantName,
    parent_name: parsed.data.parentName,
    phone: parsed.data.phone,
    email: parsed.data.email || "",
    applying_grade: parsed.data.applyingGrade,
    source: parsed.data.schoolCode ? `Microsite /s/${parsed.data.schoolCode}` : "Public /apply",
    status: "New",
    notes: parsed.data.notes ?? "",
  });

  if (error) return { ok: false, error: getErrorMessage(error, "Unable to save admission enquiry.") };
  revalidatePath("/admin/students/enquiries");
  return { ok: true, data: { enquiryNo } };
}

export async function listStudentsAction(params?: { search?: string; status?: string }) {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false as const, error: "Authentication required." };

  const admin = createAdminClient();
  let q = admin
    .from("students")
    .select("*, school_classes(name)")
    .eq("school_id", ctx.schoolId)
    .is("deleted_at", null)
    .order("full_name", { ascending: true })
    .limit(150);

  if (params?.status && params.status !== "All") q = q.eq("status", params.status);
  if (params?.search?.trim()) {
    const s = params.search.trim();
    q = q.or(`full_name.ilike.%${s}%,admission_no.ilike.%${s}%`);
  }

  const { data, error } = await q;
  if (error) return { ok: false as const, error: getErrorMessage(error) };
  return { ok: true as const, data: data ?? [] };
}

export async function getStudentDetailAction(studentId?: string) {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false as const, error: "Authentication required." };

  const admin = createAdminClient();
  let targetQuery = admin
    .from("students")
    .select("*, school_classes(name)")
    .eq("school_id", ctx.schoolId)
    .is("deleted_at", null);

  if (studentId) targetQuery = targetQuery.eq("id", studentId);
  else if (ctx.role === "student") targetQuery = targetQuery.eq("profile_id", ctx.userId);

  const { data: student } = await targetQuery.limit(1).maybeSingle();
  if (!student) return { ok: false as const, error: "Student profile not found." };

  const [guardiansRes, remarksRes, marksRes, receiptsRes, attendanceRes] = await Promise.all([
    admin.from("parent_students").select("is_primary, sibling_group_key, guardians(*)").eq("student_id", student.id),
    admin.from("student_remarks").select("*").eq("student_id", student.id).order("created_at", { ascending: false }),
    admin.from("exam_marks").select("*, exams(name), subjects(name)").eq("student_id", student.id),
    admin.from("fee_receipts").select("*").eq("student_id", student.id).order("paid_at", { ascending: false }),
    admin.from("student_attendance").select("*").eq("student_id", student.id).order("attendance_date", { ascending: false }).limit(30),
  ]);

  return {
    ok: true as const,
    data: {
      student,
      guardians: guardiansRes.data ?? [],
      remarks: remarksRes.data ?? [],
      marks: marksRes.data ?? [],
      receipts: receiptsRes.data ?? [],
      attendance: attendanceRes.data ?? [],
    },
  };
}

const createStudentSchema = z.object({
  admissionNo: z.string().trim().min(2),
  fullName: z.string().trim().min(2),
  classId: z.string().uuid().optional(),
  sectionName: z.string().trim().default("A"),
  rollNo: z.string().trim().default("01"),
  gender: z.enum(["Male", "Female", "Other", "Unspecified"]).default("Unspecified"),
  guardianName: z.string().trim().min(2),
  guardianPhone: z.string().trim().min(7),
  guardianEmail: z.string().trim().optional(),
  address: z.string().trim().default(""),
});

export async function createStudentAdmissionAction(
  raw: z.input<typeof createStudentSchema>,
): Promise<ActionResult<{ studentId: string }>> {
  const auth = await requireTenantWrite("staff_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const parsed = createStudentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid student input." };
  const d = parsed.data;

  // Plan quota check (block at 100%)
  const { data: usage } = await auth.admin.rpc("get_school_usage_summary", { p_school_id: auth.ctx.schoolId });
  const u = usage?.[0];
  if (u && Number(u.students_count) >= Number(u.max_students)) {
    return {
      ok: false,
      error: `Student quota reached (${u.students_count}/${u.max_students}). Upgrade your EduCore plan to admit more students.`,
    };
  }

  let classId = d.classId;
  if (!classId) {
    const { data: firstCls } = await auth.admin
      .from("school_classes")
      .select("id")
      .eq("school_id", auth.ctx.schoolId)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();
    classId = firstCls?.id;
  }

  const { data: ay } = await auth.admin
    .from("academic_years")
    .select("id")
    .eq("school_id", auth.ctx.schoolId)
    .eq("status", "Active")
    .maybeSingle();

  const { data: stu, error: stuErr } = await auth.admin
    .from("students")
    .insert({
      school_id: auth.ctx.schoolId,
      admission_no: d.admissionNo.toUpperCase(),
      full_name: d.fullName,
      class_id: classId ?? null,
      academic_year_id: ay?.id ?? null,
      section_name: d.sectionName.toUpperCase(),
      roll_no: d.rollNo,
      gender: d.gender,
      address: d.address,
      emergency_contact: d.guardianPhone,
      status: "Active",
    })
    .select("id")
    .single();

  if (stuErr || !stu) return { ok: false, error: getErrorMessage(stuErr, "Unable to admit student.") };

  const { data: grd } = await auth.admin
    .from("guardians")
    .insert({
      school_id: auth.ctx.schoolId,
      full_name: d.guardianName,
      phone: d.guardianPhone,
      email: d.guardianEmail ?? "",
      address: d.address,
    })
    .select("id")
    .single();

  if (grd) {
    await auth.admin.from("parent_students").insert({
      school_id: auth.ctx.schoolId,
      guardian_id: grd.id,
      student_id: stu.id,
      is_primary: true,
    });
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/students/applications");
  return { ok: true, data: { studentId: stu.id } };
}

export async function addStudentRemarkAction(params: {
  studentId: string;
  category: "Academic" | "Discipline" | "Achievement" | "Medical";
  note: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("teacher_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { error } = await auth.admin.from("student_remarks").insert({
    school_id: auth.ctx.schoolId,
    student_id: params.studentId,
    author_name: auth.ctx.userName,
    category: params.category,
    note: params.note.trim(),
  });
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/admin/students/profile");
  return { ok: true };
}

export async function listEnquiriesAction() {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false as const, error: "Authentication required." };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admission_enquiries")
    .select("*")
    .eq("school_id", ctx.schoolId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return { ok: false as const, error: getErrorMessage(error) };
  return { ok: true as const, data: data ?? [] };
}

export async function updateEnquiryStatusAction(params: {
  enquiryId: string;
  status: "New" | "Contacted" | "Assessment Scheduled" | "Approved" | "Rejected" | "Enrolled";
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("staff_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  const { error } = await auth.admin
    .from("admission_enquiries")
    .update({ status: params.status })
    .eq("id", params.enquiryId)
    .eq("school_id", auth.ctx.schoolId);
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/admin/students/enquiries");
  revalidatePath("/admin/students/applications");
  return { ok: true };
}

// ---------- D4: Teachers, Staff, Leaves & Payroll ----------

export async function listStaffMembersAction(category?: "Teacher" | "Staff") {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false as const, error: "Authentication required." };
  const admin = createAdminClient();
  let q = admin
    .from("staff_members")
    .select("*")
    .eq("school_id", ctx.schoolId)
    .is("deleted_at", null)
    .order("full_name", { ascending: true });
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) return { ok: false as const, error: getErrorMessage(error) };
  return { ok: true as const, data: data ?? [] };
}

export async function upsertStaffMemberAction(params: {
  employeeCode: string;
  fullName: string;
  category: "Teacher" | "Staff";
  subRole?: string;
  department: string;
  designation: string;
  qualification?: string;
  phone?: string;
  email?: string;
  baseSalaryInr: number;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  if (params.category === "Teacher") {
    const { data: usage } = await auth.admin.rpc("get_school_usage_summary", { p_school_id: auth.ctx.schoolId });
    const u = usage?.[0];
    if (u && Number(u.teachers_count) >= Number(u.max_teachers)) {
      return { ok: false, error: `Teacher quota reached (${u.teachers_count}/${u.max_teachers}).` };
    }
  }

  const { error } = await auth.admin.from("staff_members").upsert(
    {
      school_id: auth.ctx.schoolId,
      employee_code: params.employeeCode.trim().toUpperCase(),
      full_name: params.fullName.trim(),
      category: params.category,
      sub_role: params.subRole || null,
      department: params.department.trim(),
      designation: params.designation.trim(),
      qualification: params.qualification ?? "",
      phone: params.phone ?? "",
      email: params.email ?? "",
      base_salary_inr: params.baseSalaryInr,
      status: "Active",
    },
    { onConflict: "school_id,employee_code" },
  );
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/admin/teachers");
  revalidatePath("/admin/staff");
  return { ok: true };
}

export async function listLeaveRequestsAction() {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false as const, error: "Authentication required." };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("staff_leave_requests")
    .select("*, staff_members(employee_code, full_name, department, leave_balance_days)")
    .eq("school_id", ctx.schoolId)
    .order("created_at", { ascending: false });
  if (error) return { ok: false as const, error: getErrorMessage(error) };
  return { ok: true as const, data: data ?? [] };
}

export async function reviewLeaveRequestAction(params: {
  leaveId: string;
  decision: "Approved" | "Rejected";
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { data: req } = await auth.admin
    .from("staff_leave_requests")
    .select("id, staff_id, days_count, status")
    .eq("id", params.leaveId)
    .eq("school_id", auth.ctx.schoolId)
    .single();
  if (!req) return { ok: false, error: "Leave request not found." };

  const { error } = await auth.admin
    .from("staff_leave_requests")
    .update({ status: params.decision, reviewed_by: auth.ctx.userId })
    .eq("id", req.id);
  if (error) return { ok: false, error: getErrorMessage(error) };

  if (params.decision === "Approved" && req.status === "Pending") {
    const { data: sm } = await auth.admin
      .from("staff_members")
      .select("leave_balance_days")
      .eq("id", req.staff_id)
      .single();
    if (sm) {
      await auth.admin
        .from("staff_members")
        .update({ leave_balance_days: Math.max(0, sm.leave_balance_days - req.days_count) })
        .eq("id", req.staff_id);
    }
  }

  revalidatePath("/admin/staff/leave-requests");
  revalidatePath("/teacher/leave");
  return { ok: true };
}

export async function applyTeacherLeaveAction(params: {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("any_auth");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  let { data: staff } = await auth.admin
    .from("staff_members")
    .select("id")
    .eq("school_id", auth.ctx.schoolId)
    .eq("profile_id", auth.ctx.userId)
    .maybeSingle();

  if (!staff) {
    const { data: fallbackStaff } = await auth.admin
      .from("staff_members")
      .select("id")
      .eq("school_id", auth.ctx.schoolId)
      .limit(1)
      .maybeSingle();
    staff = fallbackStaff;
  }
  if (!staff) return { ok: false, error: "No linked staff record found." };

  const daysCount = Math.max(
    1,
    Math.ceil((new Date(params.toDate).getTime() - new Date(params.fromDate).getTime()) / 86_400_000) + 1,
  );
  const { error } = await auth.admin.from("staff_leave_requests").insert({
    school_id: auth.ctx.schoolId,
    staff_id: staff.id,
    leave_type: params.leaveType,
    from_date: params.fromDate,
    to_date: params.toDate,
    days_count: daysCount,
    reason: params.reason.trim(),
    status: "Pending",
  });
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/teacher/leave");
  revalidatePath("/admin/staff/leave-requests");
  return { ok: true };
}

export async function runMonthlyPayrollAction(monthLabel: string): Promise<ActionResult<{ processed: number }>> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { data: members } = await auth.admin
    .from("staff_members")
    .select("*")
    .eq("school_id", auth.ctx.schoolId)
    .is("deleted_at", null)
    .eq("status", "Active");

  if (!members || members.length === 0) return { ok: false, error: "No active staff members." };

  const payload = members.map((m) => {
    const gross = Number(m.base_salary_inr) + Number(m.allowances_inr);
    const ded = Number(m.deductions_inr);
    return {
      school_id: auth.ctx!.schoolId,
      staff_id: m.id,
      month_label: monthLabel,
      gross_inr: gross,
      deductions_inr: ded,
      net_inr: Math.max(0, gross - ded),
      status: "Paid",
      paid_at: new Date().toISOString(),
    };
  });

  const { error } = await auth.admin
    .from("payroll_slips")
    .upsert(payload, { onConflict: "school_id,staff_id,month_label" });
  if (error) return { ok: false, error: getErrorMessage(error) };

  revalidatePath("/admin/staff/payroll");
  revalidatePath("/admin/staff/salary-slip");
  return { ok: true, data: { processed: payload.length } };
}

export async function listPayrollSlipsAction() {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false as const, error: "Authentication required." };
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("payroll_slips")
    .select("*, staff_members(employee_code, full_name, department, designation)")
    .eq("school_id", ctx.schoolId)
    .order("created_at", { ascending: false });
  if (error) return { ok: false as const, error: getErrorMessage(error) };
  return { ok: true as const, data: data ?? [] };
}

// ---------- D5: Attendance (with Lock Window + Absent Alert) & Conflict-Checked Timetable ----------

export async function markStudentAttendanceBatchAction(params: {
  classId: string;
  sectionName: string;
  attendanceDate: string;
  entries: Array<{ studentId: string; status: "Present" | "Absent" | "Late" | "Excused" }>;
}): Promise<ActionResult<{ marked: number; absentAlertsQueued: number }>> {
  const auth = await requireTenantWrite("teacher_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  // Edit lock window check (non-admin locked after 2 days)
  const diffDays = Math.floor((Date.now() - new Date(params.attendanceDate).getTime()) / 86_400_000);
  if (diffDays > 2 && !["school_admin", "admin", "principal"].includes(auth.ctx.role)) {
    return {
      ok: false,
      error: "Attendance edit window (48 hours) has closed. Ask School Admin to amend past records.",
    };
  }

  const rows = params.entries.map((e) => ({
    school_id: auth.ctx!.schoolId,
    class_id: params.classId,
    section_name: params.sectionName,
    attendance_date: params.attendanceDate,
    student_id: e.studentId,
    status: e.status,
    marked_by: auth.ctx!.userId,
  }));

  const { error } = await auth.admin
    .from("student_attendance")
    .upsert(rows, { onConflict: "school_id,student_id,attendance_date" });
  if (error) return { ok: false, error: getErrorMessage(error) };

  // Queue absent alerts to guardians
  let absentAlertsQueued = 0;
  const absentIds = params.entries.filter((e) => e.status === "Absent").map((e) => e.studentId);
  if (absentIds.length > 0) {
    const { data: links } = await auth.admin
      .from("parent_students")
      .select("student_id, students(full_name), guardians(phone, email, consent_sms)")
      .in("student_id", absentIds);
    for (const l of links ?? []) {
      const g = Array.isArray(l.guardians) ? l.guardians[0] : l.guardians;
      const s = Array.isArray(l.students) ? l.students[0] : l.students;
      if (g && (g.email || g.phone)) {
        await dispatchCommunication({
          schoolId: auth.ctx.schoolId,
          channel: g.consent_sms ? "SMS" : "Email",
          recipient: g.phone || g.email,
          subject: `Absence Alert: ${s?.full_name ?? "Student"} (${params.attendanceDate})`,
          body: `${s?.full_name ?? "Your ward"} was marked Absent on ${params.attendanceDate}.`,
        });
        absentAlertsQueued += 1;
      }
    }
  }

  revalidatePath("/admin/attendance/students");
  revalidatePath("/teacher/attendance");
  return { ok: true, data: { marked: rows.length, absentAlertsQueued } };
}

export async function addTimetableSlotAction(params: {
  classId: string;
  sectionName: string;
  dayOfWeek: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  roomNo: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  // Double-booking conflict detection: teacher OR room already scheduled at same day + period
  const { data: conflicts } = await auth.admin
    .from("timetable_slots")
    .select("id, teacher_id, room_no, class_id, section_name")
    .eq("school_id", auth.ctx.schoolId)
    .eq("day_of_week", params.dayOfWeek)
    .eq("period_number", params.periodNumber);

  for (const c of conflicts ?? []) {
    if (c.class_id === params.classId && c.section_name === params.sectionName) continue;
    if (params.teacherId && c.teacher_id === params.teacherId) {
      return {
        ok: false,
        error: `Conflict: Selected teacher is already scheduled in Period ${params.periodNumber} on ${params.dayOfWeek}.`,
      };
    }
    if (params.roomNo.trim() && c.room_no.toLowerCase() === params.roomNo.trim().toLowerCase()) {
      return {
        ok: false,
        error: `Conflict: Room ${params.roomNo} is already booked in Period ${params.periodNumber} on ${params.dayOfWeek}.`,
      };
    }
  }

  const { error } = await auth.admin.from("timetable_slots").upsert(
    {
      school_id: auth.ctx.schoolId,
      class_id: params.classId,
      section_name: params.sectionName,
      day_of_week: params.dayOfWeek,
      period_number: params.periodNumber,
      start_time: params.startTime,
      end_time: params.endTime,
      subject_id: params.subjectId,
      teacher_id: params.teacherId,
      room_no: params.roomNo.trim(),
    },
    { onConflict: "school_id,class_id,section_name,day_of_week,period_number" },
  );
  if (error) return { ok: false, error: getErrorMessage(error) };

  revalidatePath("/admin/timetable/builder");
  revalidatePath("/admin/timetable/classes");
  revalidatePath("/teacher/timetable");
  return { ok: true };
}

export async function listTeacherAllocationsAndSubsAction() {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false as const, error: "Authentication required." };
  const admin = createAdminClient();
  const [allocRes, subsRes, teachersRes, classesRes, slotsRes, subjectsRes] = await Promise.all([
    admin
      .from("teacher_assignments")
      .select("*, staff_members(full_name), school_classes(name), subjects(name)")
      .eq("school_id", ctx.schoolId)
      .order("created_at", { ascending: false }),
    admin
      .from("timetable_substitutions")
      .select("*, timetable_slots(period_number, section_name, school_classes(name), subjects(name))")
      .eq("school_id", ctx.schoolId)
      .order("sub_date", { ascending: false })
      .limit(50),
    admin
      .from("staff_members")
      .select("id, full_name, department")
      .eq("school_id", ctx.schoolId)
      .eq("category", "Teacher")
      .is("deleted_at", null)
      .order("full_name"),
    admin
      .from("school_classes")
      .select("id, name, room_block")
      .eq("school_id", ctx.schoolId)
      .is("deleted_at", null)
      .order("grade_order"),
    admin
      .from("timetable_slots")
      .select("id, period_number, section_name, room_no, teacher_id, school_classes(name), subjects(name), staff_members(full_name)")
      .eq("school_id", ctx.schoolId)
      .limit(50),
    admin
      .from("subjects")
      .select("id, name, periods_per_week")
      .eq("school_id", ctx.schoolId)
      .is("deleted_at", null)
      .order("name"),
  ]);

  return {
    ok: true as const,
    data: {
      allocations: allocRes.data ?? [],
      substitutions: subsRes.data ?? [],
      teachers: teachersRes.data ?? [],
      classes: classesRes.data ?? [],
      slots: slotsRes.data ?? [],
      subjects: subjectsRes.data ?? [],
    },
  };
}

export async function saveTeacherAllocationAction(params: {
  classId: string;
  sectionName: string;
  teacherId: string;
  subjectId?: string;
  periodsPerWeek: number;
  isClassTeacher?: boolean;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  const { error } = await auth.admin.from("teacher_assignments").insert({
    school_id: auth.ctx.schoolId,
    class_id: params.classId,
    section_name: params.sectionName,
    teacher_id: params.teacherId,
    subject_id: params.subjectId ?? null,
    periods_per_week: params.periodsPerWeek,
    is_class_teacher: Boolean(params.isClassTeacher),
  });
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/admin/teachers/assignments");
  return { ok: true };
}

export async function saveTimetableSubstitutionAction(params: {
  slotId?: string;
  substituteTeacherId: string;
  originalTeacherId?: string | null;
  subDate: string;
  reason: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  let targetSlotId = params.slotId;
  if (!targetSlotId) {
    const { data: firstSlot } = await auth.admin
      .from("timetable_slots")
      .select("id")
      .eq("school_id", auth.ctx.schoolId)
      .limit(1)
      .maybeSingle();
    targetSlotId = firstSlot?.id;
  }
  if (!targetSlotId) return { ok: false, error: "Create at least one timetable slot before assigning substitutes." };

  const { error } = await auth.admin.from("timetable_substitutions").insert({
    school_id: auth.ctx.schoolId,
    slot_id: targetSlotId,
    original_teacher_id: params.originalTeacherId ?? null,
    substitute_teacher_id: params.substituteTeacherId,
    sub_date: params.subDate,
    reason: params.reason.trim() || "Staff leave cover",
  });
  if (error) return { ok: false, error: getErrorMessage(error) };

  await dispatchCommunication({
    schoolId: auth.ctx.schoolId,
    channel: "In-App",
    recipient: params.substituteTeacherId,
    subject: `Substitution Assigned (${params.subDate})`,
    body: `You have been assigned substitute cover on ${params.subDate}: ${params.reason}`,
  });

  revalidatePath("/admin/timetable/substitutions");
  return { ok: true };
}
