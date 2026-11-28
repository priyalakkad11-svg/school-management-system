"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getErrorMessage } from "@/lib/errors";
import { getIndianFinancialYear } from "@/lib/saas-pricing";
import { dispatchCommunication } from "@/lib/comms-adapter";
import { getTenantSession, requireTenantWrite } from "@/lib/tenant-context";
import type { ActionResult } from "@/app/actions/auth.actions";

// ---------- D6: Exams, Grade Scales, Marks Lock/Unlock & QR Verification ----------

export async function listExamsAndScalesAction() {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false as const, error: "Authentication required." };
  const admin = createAdminClient();
  const [examsRes, scalesRes] = await Promise.all([
    admin.from("exams").select("*").eq("school_id", ctx.schoolId).order("start_date", { ascending: false }),
    admin.from("grade_scales").select("*").eq("school_id", ctx.schoolId).order("min_percent", { ascending: false }),
  ]);
  return {
    ok: true as const,
    data: { exams: examsRes.data ?? [], scales: scalesRes.data ?? [] },
  };
}

export async function createExamAction(params: {
  name: string;
  termName: string;
  weightagePct: number;
  startDate: string;
  endDate: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { error } = await auth.admin.from("exams").insert({
    school_id: auth.ctx.schoolId,
    name: params.name.trim(),
    term_name: params.termName.trim(),
    weightage_pct: params.weightagePct,
    start_date: params.startDate,
    end_date: params.endDate,
    status: "Scheduled",
  });
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/admin/exams");
  revalidatePath("/admin/exams/create");
  return { ok: true };
}

export async function saveExamMarksAction(params: {
  examId: string;
  subjectId: string;
  entries: Array<{ studentId: string; theory: number; practical: number; maxMarks: number; isAbsent?: boolean }>;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("teacher_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const [{ data: exam }, { data: scales }] = await Promise.all([
    auth.admin.from("exams").select("status").eq("id", params.examId).eq("school_id", auth.ctx.schoolId).single(),
    auth.admin.from("grade_scales").select("*").eq("school_id", auth.ctx.schoolId).order("min_percent", { ascending: false }),
  ]);
  if (exam?.status === "Published" && !["school_admin", "admin", "principal"].includes(auth.ctx.role)) {
    return { ok: false, error: "Exam results are published and marks are locked." };
  }

  const computeGrade = (pct: number) => {
    const match = (scales ?? []).find((s) => pct >= Number(s.min_percent) && pct <= Number(s.max_percent));
    return match?.grade ?? (pct >= 91 ? "A1" : pct >= 81 ? "A2" : pct >= 71 ? "B1" : pct >= 61 ? "B2" : pct >= 33 ? "D" : "E");
  };

  const rows = params.entries.map((e) => {
    const total = e.isAbsent ? 0 : e.theory + e.practical;
    const pct = e.maxMarks > 0 ? (total / e.maxMarks) * 100 : 0;
    return {
      school_id: auth.ctx!.schoolId,
      exam_id: params.examId,
      student_id: e.studentId,
      subject_id: params.subjectId,
      theory_marks: e.theory,
      practical_marks: e.practical,
      max_marks: e.maxMarks,
      grade: e.isAbsent ? "AB" : computeGrade(pct),
      is_absent: Boolean(e.isAbsent),
      entered_by: auth.ctx!.userId,
    };
  });

  const { error } = await auth.admin
    .from("exam_marks")
    .upsert(rows, { onConflict: "school_id,exam_id,student_id,subject_id" });
  if (error) return { ok: false, error: getErrorMessage(error) };

  revalidatePath("/admin/exams/marks-entry");
  revalidatePath("/teacher/marks-entry");
  return { ok: true };
}

export async function togglePublishExamAction(params: {
  examId: string;
  publish: boolean;
  unlockReason?: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  if (!params.publish && (!params.unlockReason || params.unlockReason.trim().length < 5)) {
    return { ok: false, error: "Provide an audit reason to unlock published marks." };
  }

  await auth.admin
    .from("exams")
    .update({
      status: params.publish ? "Published" : "Ongoing",
      published_at: params.publish ? new Date().toISOString() : null,
    })
    .eq("id", params.examId)
    .eq("school_id", auth.ctx.schoolId);

  await auth.admin
    .from("exam_marks")
    .update({
      is_locked: params.publish,
      unlocked_by: params.publish ? null : auth.ctx.userId,
      unlock_reason: params.publish ? null : params.unlockReason?.trim() ?? null,
    })
    .eq("exam_id", params.examId)
    .eq("school_id", auth.ctx.schoolId);

  revalidatePath("/admin/exams/results");
  revalidatePath("/student/results");
  revalidatePath("/parent/results");
  return { ok: true };
}

export async function issueQrVerificationTokenAction(params: {
  docType: "report_card" | "id_card" | "certificate" | "tc";
  studentId: string;
  referenceCode: string;
  summary: Record<string, string>;
}): Promise<ActionResult<{ token: string; verifyPath: string }>> {
  const auth = await requireTenantWrite("staff_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { data, error } = await auth.admin
    .from("qr_verification_tokens")
    .insert({
      school_id: auth.ctx.schoolId,
      doc_type: params.docType,
      student_id: params.studentId,
      reference_code: params.referenceCode,
      summary: params.summary,
    })
    .select("token")
    .single();
  if (error || !data) return { ok: false, error: getErrorMessage(error) };

  return { ok: true, data: { token: data.token, verifyPath: `/verify/${data.token}` } };
}

export async function revokeQrTokenAction(token: string): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  const { error } = await auth.admin
    .from("qr_verification_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token", token)
    .eq("school_id", auth.ctx.schoolId);
  if (error) return { ok: false, error: getErrorMessage(error) };
  return { ok: true };
}

export async function verifyPublicQrToken(token: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("qr_verification_tokens")
    .select("token, doc_type, reference_code, summary, revoked_at, created_at, schools(name, school_code, board)")
    .eq("token", token)
    .maybeSingle();
  return data ?? null;
}

// ---------- D7: Fees, Gapless FY Receipts, Refunds & Defaulters ----------

export async function listFeesDataAction() {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false as const, error: "Authentication required." };
  const admin = createAdminClient();

  const [headsRes, structRes, receiptsRes, defaultersRes] = await Promise.all([
    admin.from("fee_heads").select("*").eq("school_id", ctx.schoolId).order("name"),
    admin.from("fee_structures").select("*, school_classes(name), fee_heads(name)").eq("school_id", ctx.schoolId),
    admin.from("fee_receipts").select("*, students(admission_no, full_name, section_name)").eq("school_id", ctx.schoolId).order("paid_at", { ascending: false }).limit(100),
    admin.from("students").select("id, admission_no, full_name, section_name, fee_balance_inr, school_classes(name)").eq("school_id", ctx.schoolId).gt("fee_balance_inr", 0).is("deleted_at", null).order("fee_balance_inr", { ascending: false }),
  ]);

  return {
    ok: true as const,
    data: {
      heads: headsRes.data ?? [],
      structures: structRes.data ?? [],
      receipts: receiptsRes.data ?? [],
      defaulters: defaultersRes.data ?? [],
    },
  };
}

export async function collectStudentFeeAction(params: {
  studentId: string;
  amountInr: number;
  concessionInr?: number;
  lateFeeInr?: number;
  paymentMode: "Cash" | "UPI" | "Bank Transfer" | "Cheque" | "Card";
  referenceNo?: string;
}): Promise<ActionResult<{ receiptId: string; receiptNumber: string }>> {
  const auth = await requireTenantWrite("staff_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  if (params.amountInr <= 0) return { ok: false, error: "Enter a valid positive fee amount." };

  const fy = getIndianFinancialYear();
  const { data: receiptNumber, error: seqErr } = await auth.admin.rpc("next_fee_receipt_number", {
    p_school_id: auth.ctx.schoolId,
    p_fy: fy,
  });
  if (seqErr || !receiptNumber) return { ok: false, error: getErrorMessage(seqErr, "Receipt sequence failed.") };

  const { data: stu } = await auth.admin
    .from("students")
    .select("id, full_name, fee_balance_inr, emergency_contact")
    .eq("id", params.studentId)
    .eq("school_id", auth.ctx.schoolId)
    .single();
  if (!stu) return { ok: false, error: "Student not found in active school." };

  const { data: receipt, error: recErr } = await auth.admin
    .from("fee_receipts")
    .insert({
      school_id: auth.ctx.schoolId,
      receipt_number: receiptNumber,
      financial_year: fy,
      student_id: stu.id,
      amount_inr: params.amountInr,
      concession_inr: params.concessionInr ?? 0,
      late_fee_inr: params.lateFeeInr ?? 0,
      payment_mode: params.paymentMode,
      reference_no: params.referenceNo?.trim() || `${params.paymentMode}-${Date.now()}`,
      collected_by: auth.ctx.userId,
    })
    .select("id")
    .single();
  if (recErr || !receipt) return { ok: false, error: getErrorMessage(recErr) };

  const nextBal = Math.max(0, Number(stu.fee_balance_inr) - params.amountInr - (params.concessionInr ?? 0));
  await auth.admin.from("students").update({ fee_balance_inr: nextBal }).eq("id", stu.id);

  await dispatchCommunication({
    schoolId: auth.ctx.schoolId,
    channel: "Email",
    recipient: stu.emergency_contact || "parent@school.local",
    subject: `Fee Receipt ${receiptNumber} — ₹${params.amountInr}`,
    body: `Payment of INR ${params.amountInr} received for ${stu.full_name} via ${params.paymentMode}. Remaining balance: INR ${nextBal}.`,
  });

  revalidatePath("/admin/fees/collect");
  revalidatePath("/admin/fees/defaulters");
  revalidatePath("/admin/fees/receipt");
  return { ok: true, data: { receiptId: receipt.id, receiptNumber } };
}

export async function issueFeeRefundAction(params: {
  receiptId: string;
  amountInr: number;
  reason: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  if (params.reason.trim().length < 5) return { ok: false, error: "Provide an audit reason for refund." };

  const { data: rcp } = await auth.admin
    .from("fee_receipts")
    .select("id, student_id, amount_inr")
    .eq("id", params.receiptId)
    .eq("school_id", auth.ctx.schoolId)
    .single();
  if (!rcp || params.amountInr > Number(rcp.amount_inr)) {
    return { ok: false, error: "Invalid receipt or refund amount exceeds collected payment." };
  }

  const { error } = await auth.admin.from("fee_refunds").insert({
    school_id: auth.ctx.schoolId,
    receipt_id: rcp.id,
    student_id: rcp.student_id,
    amount_inr: params.amountInr,
    reason: params.reason.trim(),
    refunded_by: auth.ctx.userId,
  });
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/admin/fees/collect");
  return { ok: true };
}

// ---------- D8: Notices, Events, Complaints, Messages, Notifications ----------

export async function listNoticesAndEventsAction() {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false as const, error: "Authentication required." };
  const admin = createAdminClient();
  const [noticesRes, eventsRes, complaintsRes, notifRes] = await Promise.all([
    admin.from("notices").select("*").eq("school_id", ctx.schoolId).order("published_at", { ascending: false }).limit(50),
    admin.from("campus_events").select("*").eq("school_id", ctx.schoolId).order("event_date", { ascending: true }).limit(50),
    admin.from("complaints").select("*").eq("school_id", ctx.schoolId).order("created_at", { ascending: false }).limit(50),
    admin.from("notifications").select("*").eq("school_id", ctx.schoolId).order("created_at", { ascending: false }).limit(50),
  ]);
  return {
    ok: true as const,
    data: {
      notices: noticesRes.data ?? [],
      events: eventsRes.data ?? [],
      complaints: complaintsRes.data ?? [],
      notifications: notifRes.data ?? [],
    },
  };
}

export async function publishNoticeAction(params: {
  title: string;
  body: string;
  category: string;
  targetRoles: string[];
  isPublic?: boolean;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("staff_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { error } = await auth.admin.from("notices").insert({
    school_id: auth.ctx.schoolId,
    title: params.title.trim(),
    body: params.body.trim(),
    category: params.category,
    target_roles: params.targetRoles.length > 0 ? params.targetRoles : ["admin", "teacher", "student", "parent"],
    is_public: Boolean(params.isPublic),
    published_by: auth.ctx.userId,
  });
  if (error) return { ok: false, error: getErrorMessage(error) };

  await dispatchCommunication({
    schoolId: auth.ctx.schoolId,
    channel: "In-App",
    recipient: params.targetRoles.join(","),
    subject: params.title.trim(),
    body: params.body.trim(),
  });

  revalidatePath("/admin/communication/notices");
  revalidatePath("/notices");
  return { ok: true };
}

export async function updateComplaintAction(params: {
  complaintId: string;
  status: "Open" | "In Review" | "Resolved";
  resolutionNote: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("staff_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  const { error } = await auth.admin
    .from("complaints")
    .update({ status: params.status, resolution_note: params.resolutionNote })
    .eq("id", params.complaintId)
    .eq("school_id", auth.ctx.schoolId);
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/admin/communication/complaints");
  return { ok: true };
}

// ---------- D9: LMS Homework, Private Storage Submissions & Student Leave ----------

export async function uploadStudyMaterialAction(formData: FormData): Promise<ActionResult<{ storagePath: string; signedUrl: string | null }>> {
  const auth = await requireTenantWrite("teacher_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const file = formData.get("file");
  const title = String(formData.get("title") ?? "").trim();
  const classId = String(formData.get("classId") ?? "") || null;
  if (!(file instanceof File) || file.size === 0 || !title) {
    return { ok: false, error: "Provide a document title and PDF/image file." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const path = `${auth.ctx.schoolId}/${auth.ctx.userId}/mat-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await auth.admin.storage
    .from("study-material")
    .upload(path, buffer, { contentType: file.type || "application/pdf", upsert: true });
  if (upErr) return { ok: false, error: getErrorMessage(upErr, "File upload failed.") };

  const { error: dbErr } = await auth.admin.from("study_materials").insert({
    school_id: auth.ctx.schoolId,
    class_id: classId,
    title,
    storage_path: path,
    uploaded_by: auth.ctx.userId,
  });
  if (dbErr) return { ok: false, error: getErrorMessage(dbErr) };

  const signed = await auth.admin.storage.from("study-material").createSignedUrl(path, 3600);
  revalidatePath("/teacher/study-material");
  revalidatePath("/student/study-material");
  return { ok: true, data: { storagePath: path, signedUrl: signed.data?.signedUrl ?? null } };
}

export async function getStudyMaterialSignedUrlAction(
  storagePath: string,
): Promise<ActionResult<{ signedUrl: string | null }>> {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false, error: "Authentication required." };
  const admin = createAdminClient();
  const signed = await admin.storage.from("study-material").createSignedUrl(storagePath, 3600);
  if (signed.error) return { ok: false, error: getErrorMessage(signed.error, "Resource file not found in bucket.") };
  return { ok: true, data: { signedUrl: signed.data?.signedUrl ?? null } };
}

export async function submitHelpdeskTicketAction(params: {
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("any_auth");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { error } = await auth.admin.from("support_tickets").insert({
    school_id: auth.ctx.schoolId,
    created_by: auth.ctx.userId,
    subject: params.subject.trim(),
    category: params.category,
    priority: params.priority,
    description: params.description.trim(),
    status: "open",
  });
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/help");
  revalidatePath("/platform/tickets");
  return { ok: true };
}

// ---------- D11-D12: Library, Transport, Hostel, Inventory & Certificates ----------

export async function listP1OperationsDataAction() {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false as const, error: "Authentication required." };
  const admin = createAdminClient();
  const [booksRes, issuesRes, vehiclesRes, routesRes, roomsRes, allocsRes, invRes, certsRes, auditRes] =
    await Promise.all([
      admin.from("library_books").select("*").eq("school_id", ctx.schoolId).order("title"),
      admin.from("library_issues").select("*, library_books(title, accession_no)").eq("school_id", ctx.schoolId).order("issued_on", { ascending: false }),
      admin.from("transport_vehicles").select("*").eq("school_id", ctx.schoolId),
      admin.from("transport_routes").select("*, transport_vehicles(vehicle_no, driver_name)").eq("school_id", ctx.schoolId),
      admin.from("hostel_rooms").select("*").eq("school_id", ctx.schoolId).order("room_no"),
      admin.from("hostel_allocations").select("*, hostel_rooms(hostel_block, room_no), students(full_name, admission_no)").eq("school_id", ctx.schoolId),
      admin.from("inventory_items").select("*").eq("school_id", ctx.schoolId).order("name"),
      admin.from("issued_certificates").select("*, students(full_name, admission_no)").eq("school_id", ctx.schoolId).order("issued_on", { ascending: false }),
      admin.from("audit_logs").select("*").eq("school_id", ctx.schoolId).order("created_at", { ascending: false }).limit(100),
    ]);

  return {
    ok: true as const,
    data: {
      books: booksRes.data ?? [],
      issues: issuesRes.data ?? [],
      vehicles: vehiclesRes.data ?? [],
      routes: routesRes.data ?? [],
      rooms: roomsRes.data ?? [],
      allocations: allocsRes.data ?? [],
      inventory: invRes.data ?? [],
      certificates: certsRes.data ?? [],
      auditLogs: auditRes.data ?? [],
    },
  };
}

export async function issueOrReturnLibraryBookAction(params: {
  mode: "issue" | "return";
  bookId: string;
  issueId?: string;
  memberId?: string;
  memberName?: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("staff_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  if (params.mode === "issue") {
    const { data: book } = await auth.admin
      .from("library_books")
      .select("available_copies")
      .eq("id", params.bookId)
      .eq("school_id", auth.ctx.schoolId)
      .single();
    if (!book || book.available_copies <= 0) {
      return { ok: false, error: "No available copies left for issue." };
    }
    await auth.admin.from("library_issues").insert({
      school_id: auth.ctx.schoolId,
      book_id: params.bookId,
      member_type: "Student",
      member_id: params.memberId ?? auth.ctx.userId,
      member_name: params.memberName ?? "Student",
      status: "Issued",
    });
    await auth.admin
      .from("library_books")
      .update({ available_copies: book.available_copies - 1 })
      .eq("id", params.bookId);
  } else if (params.issueId) {
    const { data: issue } = await auth.admin
      .from("library_issues")
      .select("id, book_id, due_on, status")
      .eq("id", params.issueId)
      .eq("school_id", auth.ctx.schoolId)
      .single();
    if (!issue || issue.status === "Returned") return { ok: false, error: "Issue already returned." };

    const overdueDays = Math.max(0, Math.floor((Date.now() - new Date(issue.due_on).getTime()) / 86_400_000));
    const fineInr = overdueDays * 10;
    await auth.admin
      .from("library_issues")
      .update({ status: "Returned", returned_on: new Date().toISOString().slice(0, 10), fine_inr: fineInr })
      .eq("id", issue.id);

    const { data: book } = await auth.admin.from("library_books").select("available_copies").eq("id", issue.book_id).single();
    if (book) {
      await auth.admin.from("library_books").update({ available_copies: book.available_copies + 1 }).eq("id", issue.book_id);
    }
  }

  revalidatePath("/admin/library/books");
  revalidatePath("/admin/library/circulation");
  return { ok: true };
}

export async function issueSchoolCertificateAction(params: {
  studentId: string;
  docType: "Transfer Certificate" | "Bonafide Certificate" | "Character Certificate" | "Study Certificate";
  remarks?: string;
}): Promise<ActionResult<{ certificateNo: string; verifyPath: string }>> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { data: stu } = await auth.admin
    .from("students")
    .select("id, full_name, admission_no")
    .eq("id", params.studentId)
    .eq("school_id", auth.ctx.schoolId)
    .single();
  if (!stu) return { ok: false, error: "Student not found." };

  const certNo = `CERT-${auth.ctx.schoolCode}-${Math.floor(10000 + Math.random() * 89999)}`;
  const { data: qr } = await auth.admin
    .from("qr_verification_tokens")
    .insert({
      school_id: auth.ctx.schoolId,
      doc_type: params.docType === "Transfer Certificate" ? "tc" : "certificate",
      student_id: stu.id,
      reference_code: certNo,
      summary: {
        studentName: stu.full_name,
        admissionNo: stu.admission_no,
        certificateType: params.docType,
      },
    })
    .select("token")
    .single();

  const { error } = await auth.admin.from("issued_certificates").insert({
    school_id: auth.ctx.schoolId,
    certificate_no: certNo,
    doc_type: params.docType,
    student_id: stu.id,
    verification_token: qr?.token ?? null,
    remarks: params.remarks ?? "",
  });
  if (error) return { ok: false, error: getErrorMessage(error) };

  revalidatePath("/admin/documents");
  return { ok: true, data: { certificateNo: certNo, verifyPath: qr ? `/verify/${qr.token}` : "" } };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required." };
  const admin = createAdminClient();
  await admin.from("notifications").update({ is_read: true }).eq("user_id", user.id);
  revalidatePath("/notifications");
  return { ok: true };
}

export async function addSchoolHolidayAction(params: {
  title: string;
  holidayDate: string;
  category: "Gazetted" | "Academic" | "Exam" | "Event";
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  const { error } = await auth.admin.from("school_holidays").insert({
    school_id: auth.ctx.schoolId,
    title: params.title.trim(),
    holiday_date: params.holidayDate,
    category: params.category,
  });
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/admin/communication/holidays");
  return { ok: true };
}

export async function saveGradeScaleBandAction(params: {
  grade: string;
  minPercent: number;
  maxPercent: number;
  gradePoint: number;
  remark: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  const { error } = await auth.admin.from("grade_scales").insert({
    school_id: auth.ctx.schoolId,
    grade: params.grade.trim().toUpperCase(),
    min_percent: params.minPercent,
    max_percent: params.maxPercent,
    grade_point: params.gradePoint,
    remark: params.remark.trim(),
  });
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/admin/exams/grades");
  return { ok: true };
}

export async function createFeeHeadAndStructureAction(params: {
  headName: string;
  headCode: string;
  classId?: string;
  amountInr: number;
  dueDate: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const code = params.headCode.trim().toUpperCase();
  let { data: head } = await auth.admin
    .from("fee_heads")
    .select("id")
    .eq("school_id", auth.ctx.schoolId)
    .eq("code", code)
    .maybeSingle();

  if (!head) {
    const ins = await auth.admin
      .from("fee_heads")
      .insert({ school_id: auth.ctx.schoolId, name: params.headName.trim(), code })
      .select("id")
      .single();
    head = ins.data;
  }
  if (!head) return { ok: false, error: "Unable to create fee head." };

  let targetClassId = params.classId;
  if (!targetClassId) {
    const { data: cls } = await auth.admin
      .from("school_classes")
      .select("id")
      .eq("school_id", auth.ctx.schoolId)
      .limit(1)
      .maybeSingle();
    targetClassId = cls?.id;
  }
  if (!targetClassId) return { ok: false, error: "Create a class before adding fee structures." };

  const { error } = await auth.admin.from("fee_structures").insert({
    school_id: auth.ctx.schoolId,
    class_id: targetClassId,
    fee_head_id: head.id,
    amount_inr: params.amountInr,
    due_date: params.dueDate,
  });
  if (error) return { ok: false, error: getErrorMessage(error) };
  await auth.admin
    .from("school_onboarding")
    .upsert({ school_id: auth.ctx.schoolId, fee_structure_done: true }, { onConflict: "school_id" });
  revalidatePath("/admin/fees/structure");
  return { ok: true };
}

export async function createConcessionAction(params: {
  studentId: string;
  title: string;
  concessionType: "percent" | "amount";
  concessionValue: number;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  const { error } = await auth.admin.from("fee_concessions").insert({
    school_id: auth.ctx.schoolId,
    student_id: params.studentId,
    title: params.title.trim(),
    concession_type: params.concessionType,
    concession_value: params.concessionValue,
    approved_by: auth.ctx.userId,
  });
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/admin/fees/scholarships");
  return { ok: true };
}

export async function createHomeworkAssignmentAction(params: {
  classId?: string;
  title: string;
  instructions: string;
  dueDate: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("teacher_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  let clsId = params.classId;
  if (!clsId) {
    const { data: cls } = await auth.admin
      .from("school_classes")
      .select("id")
      .eq("school_id", auth.ctx.schoolId)
      .limit(1)
      .maybeSingle();
    clsId = cls?.id;
  }
  if (!clsId) return { ok: false, error: "No class available for homework assignment." };
  const { error } = await auth.admin.from("homework_assignments").insert({
    school_id: auth.ctx.schoolId,
    class_id: clsId,
    title: params.title.trim(),
    instructions: params.instructions.trim(),
    due_date: params.dueDate,
    status: "Published",
  });
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/teacher/assignments");
  revalidatePath("/student/homework");
  return { ok: true };
}

export async function submitStudentHomeworkAction(params: {
  assignmentId?: string;
  submissionText: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("any_auth");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  let { data: stu } = await auth.admin
    .from("students")
    .select("id")
    .eq("school_id", auth.ctx.schoolId)
    .eq("profile_id", auth.ctx.userId)
    .maybeSingle();
  if (!stu) {
    const { data: firstStu } = await auth.admin
      .from("students")
      .select("id")
      .eq("school_id", auth.ctx.schoolId)
      .limit(1)
      .maybeSingle();
    stu = firstStu;
  }
  let assignId = params.assignmentId;
  if (!assignId) {
    const { data: hw } = await auth.admin
      .from("homework_assignments")
      .select("id")
      .eq("school_id", auth.ctx.schoolId)
      .limit(1)
      .maybeSingle();
    assignId = hw?.id;
  }
  if (!stu || !assignId) return { ok: false, error: "Assignment or student record not found." };

  const { error } = await auth.admin.from("homework_submissions").upsert(
    {
      school_id: auth.ctx.schoolId,
      assignment_id: assignId,
      student_id: stu.id,
      submission_text: params.submissionText.trim(),
      status: "Submitted",
    },
    { onConflict: "school_id,assignment_id,student_id" },
  );
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/student/homework");
  return { ok: true };
}

export async function requestStudentLeaveAction(params: {
  fromDate: string;
  toDate: string;
  reason: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("any_auth");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { data: stu } = await auth.admin
    .from("students")
    .select("id")
    .eq("school_id", auth.ctx.schoolId)
    .limit(1)
    .maybeSingle();
  if (!stu) return { ok: false, error: "Linked student not found." };

  const { error } = await auth.admin.from("student_leave_requests").insert({
    school_id: auth.ctx.schoolId,
    student_id: stu.id,
    requested_by: auth.ctx.userId,
    from_date: params.fromDate,
    to_date: params.toDate,
    reason: params.reason.trim(),
    status: "Pending",
  });
  if (error) return { ok: false, error: getErrorMessage(error) };
  revalidatePath("/parent/leave");
  return { ok: true };
}

export async function exportSchoolComplianceArchiveAction(): Promise<ActionResult<{ json: string }>> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const [studentsRes, staffRes, receiptsRes, examsRes] = await Promise.all([
    auth.admin.from("students").select("*").eq("school_id", auth.ctx.schoolId).is("deleted_at", null),
    auth.admin.from("staff_members").select("*").eq("school_id", auth.ctx.schoolId).is("deleted_at", null),
    auth.admin.from("fee_receipts").select("*").eq("school_id", auth.ctx.schoolId),
    auth.admin.from("exams").select("*").eq("school_id", auth.ctx.schoolId),
  ]);

  const archive = {
    exportedAt: new Date().toISOString(),
    schoolCode: auth.ctx.schoolCode,
    schoolName: auth.ctx.schoolName,
    students: studentsRes.data ?? [],
    staffMembers: staffRes.data ?? [],
    feeReceipts: receiptsRes.data ?? [],
    exams: examsRes.data ?? [],
  };
  return { ok: true, data: { json: JSON.stringify(archive, null, 2) } };
}

export async function settleLibraryFineAction(params: {
  issueId: string;
  action: "collect" | "waive";
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("staff_or_admin");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  const { error } = await auth.admin
    .from("library_issues")
    .update({ fine_inr: 0, status: "Returned", returned_on: new Date().toISOString().slice(0, 10) })
    .eq("id", params.issueId)
    .eq("school_id", auth.ctx.schoolId);
  if (error) return { ok: false, error: getErrorMessage(error) };
  await auth.admin.from("audit_logs").insert({
    school_id: auth.ctx.schoolId,
    actor_id: auth.ctx.userId,
    actor_label: `${auth.ctx.userName} (${auth.ctx.role})`,
    action: `LIBRARY_FINE_${params.action.toUpperCase()}`,
    module: "library",
    table_name: "library_issues",
    record_id: params.issueId,
    new_data: { mode: params.action },
  });
  revalidatePath("/admin/library/members");
  revalidatePath("/admin/library/circulation");
  return { ok: true };
}

export async function saveSystemSecurityPolicyAction(params: {
  backupSchedule: string;
  retention: string;
  smsProvider: string;
  twoFaRequired: boolean;
  autoLockMarks: boolean;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("admin_only");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  await auth.admin.from("audit_logs").insert({
    school_id: auth.ctx.schoolId,
    actor_id: auth.ctx.userId,
    actor_label: `${auth.ctx.userName} (${auth.ctx.role})`,
    action: "SYSTEM_POLICY_UPDATED",
    module: "settings",
    table_name: "school_settings",
    record_id: auth.ctx.schoolId,
    new_data: params,
  });
  revalidatePath("/admin/system-settings");
  return { ok: true };
}

export async function payPortalFeeAction(params: {
  studentId: string;
  amountInr: number;
  paymentMode: "UPI" | "Card" | "NetBanking";
  referenceNo?: string;
}): Promise<ActionResult<{ receiptNumber: string }>> {
  const auth = await requireTenantWrite("any_auth");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  if (params.amountInr <= 0) return { ok: false, error: "Amount must be positive." };

  const fy = getIndianFinancialYear();
  const { data: receiptNumber, error: seqErr } = await auth.admin.rpc("next_fee_receipt_number", {
    p_school_id: auth.ctx.schoolId,
    p_fy: fy,
  });
  if (seqErr || !receiptNumber) return { ok: false, error: getErrorMessage(seqErr, "Receipt sequence failed.") };

  const { data: stu } = await auth.admin
    .from("students")
    .select("id, full_name, fee_balance_inr")
    .eq("id", params.studentId)
    .eq("school_id", auth.ctx.schoolId)
    .single();
  if (!stu) return { ok: false, error: "Student record not found." };

  const { error: recErr } = await auth.admin.from("fee_receipts").insert({
    school_id: auth.ctx.schoolId,
    receipt_number: receiptNumber,
    financial_year: fy,
    student_id: stu.id,
    amount_inr: params.amountInr,
    payment_mode: params.paymentMode,
    reference_no: params.referenceNo?.trim() || `${params.paymentMode}-${Date.now()}`,
    collected_by: auth.ctx.userId,
  });
  if (recErr) return { ok: false, error: getErrorMessage(recErr) };

  const nextBal = Math.max(0, Number(stu.fee_balance_inr) - params.amountInr);
  await auth.admin.from("students").update({ fee_balance_inr: nextBal }).eq("id", stu.id);

  revalidatePath("/student/fees");
  revalidatePath("/parent/fees");
  revalidatePath("/admin/fees/collect");
  return { ok: true, data: { receiptNumber } };
}

export async function acknowledgeNoticeAction(params: {
  noticeId: string;
  title: string;
}): Promise<ActionResult> {
  const auth = await requireTenantWrite("any_auth");
  if (!auth.admin || !auth.ctx || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };
  await auth.admin.from("audit_logs").insert({
    school_id: auth.ctx.schoolId,
    actor_id: auth.ctx.userId,
    actor_label: `${auth.ctx.userName} (${auth.ctx.role})`,
    action: "NOTICE_ACKNOWLEDGED",
    module: "communication",
    table_name: "notices",
    record_id: params.noticeId,
    new_data: { title: params.title },
  });
  revalidatePath("/parent/notices");
  return { ok: true };
}

export async function listPortalAcademicDataAction() {
  const ctx = await getTenantSession();
  if (!ctx) return { ok: false as const, error: "Authentication required." };
  const admin = createAdminClient();

  const [
    studentsRes,
    guardiansRes,
    classesRes,
    subjectsRes,
    examsRes,
    marksRes,
    receiptsRes,
    homeworkRes,
    submissionsRes,
    materialsRes,
    leavesRes,
    noticesRes,
    staffRes,
  ] = await Promise.all([
    admin.from("students").select("*, school_classes(name)").eq("school_id", ctx.schoolId).is("deleted_at", null).order("roll_no").limit(50),
    admin.from("parent_students").select("student_id, is_primary, guardians(*)").eq("school_id", ctx.schoolId).limit(30),
    admin.from("school_classes").select("id, name, grade_order").eq("school_id", ctx.schoolId).is("deleted_at", null).order("grade_order"),
    admin.from("subjects").select("id, name, code").eq("school_id", ctx.schoolId).is("deleted_at", null).order("name"),
    admin.from("exams").select("*").eq("school_id", ctx.schoolId).order("start_date", { ascending: false }),
    admin.from("exam_marks").select("*, exams(name), subjects(name), students(full_name, admission_no, roll_no)").eq("school_id", ctx.schoolId).limit(100),
    admin.from("fee_receipts").select("*, students(full_name, admission_no)").eq("school_id", ctx.schoolId).order("paid_at", { ascending: false }).limit(50),
    admin.from("homework_assignments").select("*, school_classes(name), subjects(name)").eq("school_id", ctx.schoolId).order("created_at", { ascending: false }).limit(50),
    admin.from("homework_submissions").select("*").eq("school_id", ctx.schoolId).order("submitted_at", { ascending: false }).limit(50),
    admin.from("study_materials").select("*, school_classes(name), subjects(name)").eq("school_id", ctx.schoolId).order("created_at", { ascending: false }).limit(50),
    admin.from("student_leave_requests").select("*, students(full_name, section_name)").eq("school_id", ctx.schoolId).order("created_at", { ascending: false }).limit(50),
    admin.from("notices").select("*").eq("school_id", ctx.schoolId).order("published_at", { ascending: false }).limit(30),
    admin.from("staff_members").select("id, full_name, department, designation").eq("school_id", ctx.schoolId).is("deleted_at", null).limit(50),
  ]);

  return {
    ok: true as const,
    data: {
      role: ctx.role,
      userName: ctx.userName,
      schoolName: ctx.schoolName,
      students: studentsRes.data ?? [],
      guardians: guardiansRes.data ?? [],
      classes: classesRes.data ?? [],
      subjects: subjectsRes.data ?? [],
      exams: examsRes.data ?? [],
      marks: marksRes.data ?? [],
      receipts: receiptsRes.data ?? [],
      homework: homeworkRes.data ?? [],
      submissions: submissionsRes.data ?? [],
      materials: materialsRes.data ?? [],
      leaves: leavesRes.data ?? [],
      notices: noticesRes.data ?? [],
      staff: staffRes.data ?? [],
    },
  };
}
