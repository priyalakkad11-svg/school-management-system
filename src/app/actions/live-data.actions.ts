"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { DEMO_SCHOOL_ID } from "@/lib/auth";
import { getTenantSession } from "@/lib/tenant-context";
import type {
  AdmissionEnquiry,
  AuditLogEntry,
  ComplaintTicket,
  ExamItem,
  FeeTransaction,
  HostelRoom,
  InventoryAsset,
  LeaveRequest,
  LibraryBook,
  MessageThread,
  NoticeItem,
  NotificationItem,
  PayrollRecord,
  StaffMember,
  Student,
  Teacher,
  TransportRoute,
} from "@/types/domain";

async function resolveScopeSchoolId(allowPublicFallback = false): Promise<string | null> {
  const ctx = await getTenantSession();
  if (ctx) return ctx.schoolId;
  return allowPublicFallback ? DEMO_SCHOOL_ID : null;
}

export async function getLiveStudentsAction(): Promise<Student[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("students")
    .select("*, school_classes(name), parent_students(is_primary, guardians(full_name, phone, email))")
    .eq("school_id", schoolId)
    .is("deleted_at", null)
    .order("full_name", { ascending: true })
    .limit(200);

  return (data ?? []).map((s) => {
    const cls = Array.isArray(s.school_classes) ? s.school_classes[0] : s.school_classes;
    const links = Array.isArray(s.parent_students) ? s.parent_students : [];
    const primaryLink = links.find((l) => l.is_primary) ?? links[0];
    const g = primaryLink?.guardians
      ? Array.isArray(primaryLink.guardians)
        ? primaryLink.guardians[0]
        : primaryLink.guardians
      : null;
    const due = Number(s.fee_balance_inr ?? 0);
    return {
      id: s.id,
      admissionId: s.admission_no,
      rollNo: s.roll_no || "—",
      name: s.full_name,
      className: cls?.name ?? "Unassigned",
      section: s.section_name || "A",
      dob: s.dob ?? "—",
      gender: (s.gender as Student["gender"]) ?? "Male",
      bloodGroup: s.blood_group || "O+",
      house: "Emerald",
      parentName: g?.full_name ?? "Guardian",
      parentPhone: g?.phone || s.emergency_contact || "—",
      parentEmail: g?.email ?? "",
      address: s.address || "Campus Zone",
      transportRoute: "Campus Bus",
      attendancePct: 95.0,
      termAvgPct: 88.0,
      feeStatus: due <= 0 ? "Paid" : due > 15000 ? "Overdue" : "Due",
      feeDueAmount: due,
      status: s.status === "Active" ? "Active" : "Transferred",
    };
  });
}

export async function getLiveEnquiriesAction(): Promise<AdmissionEnquiry[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("admission_enquiries")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(100);

  return (data ?? []).map((e) => ({
    id: e.id,
    enquiryNo: e.enquiry_no,
    childName: e.applicant_name,
    applyingClass: e.applying_grade,
    parentName: e.parent_name,
    parentPhone: e.phone,
    source: e.source === "Website Form" ? "Website Form" : e.source === "Referral" ? "Referral" : "Walk-In",
    stage:
      e.status === "Enrolled"
        ? "Enrolled"
        : e.status === "Assessment Scheduled"
          ? "Tour Scheduled"
          : e.status === "Contacted"
            ? "Follow-up Due"
            : "Form Submitted",
    score: 88,
    notes: e.notes || "",
  }));
}

export async function getLiveTeachersAction(): Promise<Teacher[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("staff_members")
    .select("*")
    .eq("school_id", schoolId)
    .eq("category", "Teacher")
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  return (data ?? []).map((t) => ({
    id: t.id,
    empId: t.employee_code,
    name: t.full_name,
    department: t.department,
    designation: t.designation,
    qualification: t.qualification || "B.Ed.",
    classesAssigned: `${t.department} Faculty`,
    periodsPerWeek: 24,
    email: t.email,
    phone: t.phone,
    salaryGross: Number(t.base_salary_inr) + Number(t.allowances_inr),
    joinDate: t.joining_date,
    status: t.status === "On Leave" || t.status === "Inactive" ? "On Leave" : "Active",
  }));
}

export async function getLiveStaffAction(): Promise<StaffMember[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("staff_members")
    .select("*")
    .eq("school_id", schoolId)
    .eq("category", "Staff")
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  return (data ?? []).map((s) => ({
    id: s.id,
    empId: s.employee_code,
    name: s.full_name,
    role: s.designation,
    department: s.department,
    shift: "08:00–16:00",
    phone: s.phone,
    salary: Number(s.base_salary_inr) + Number(s.allowances_inr),
    status: s.status === "On Leave" ? "On Leave" : "Active",
  }));
}

export async function getLiveLeavesAction(): Promise<LeaveRequest[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("staff_leave_requests")
    .select("*, staff_members(full_name, category, department)")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((l) => {
    const sm = Array.isArray(l.staff_members) ? l.staff_members[0] : l.staff_members;
    return {
      id: l.id,
      applicantName: sm?.full_name ?? "Staff Member",
      applicantRole: sm?.category === "Teacher" ? "Teacher" : "Staff",
      classOrDept: sm?.department ?? "General",
      leaveType: l.leave_type === "Medical" ? "Medical" : l.leave_type === "Family" ? "Family" : "Casual",
      dates: `${l.from_date} – ${l.to_date}`,
      days: l.days_count,
      substitute: "Assigned Dept Cover",
      reason: l.reason,
      status: l.status as LeaveRequest["status"],
    };
  });
}

export async function getLivePayrollAction(): Promise<PayrollRecord[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const [slipsRes, membersRes] = await Promise.all([
    admin.from("payroll_slips").select("*, staff_members(employee_code, full_name, designation)").eq("school_id", schoolId).order("created_at", { ascending: false }),
    admin.from("staff_members").select("*").eq("school_id", schoolId).is("deleted_at", null).limit(50),
  ]);

  if ((slipsRes.data?.length ?? 0) > 0) {
    return (slipsRes.data ?? []).map((p) => {
      const sm = Array.isArray(p.staff_members) ? p.staff_members[0] : p.staff_members;
      return {
        id: p.id,
        empId: sm?.employee_code ?? "EMP",
        name: sm?.full_name ?? "Staff",
        designation: sm?.designation ?? "Staff",
        month: p.month_label,
        basic: Math.round(Number(p.gross_inr) * 0.7),
        hra: Math.round(Number(p.gross_inr) * 0.2),
        allowance: Math.round(Number(p.gross_inr) * 0.1),
        pf: Number(p.deductions_inr),
        tds: 0,
        pt: 200,
        netPay: Number(p.net_inr),
        bankRef: `SAL-${p.id.slice(0, 6).toUpperCase()}`,
        status: p.status === "Paid" ? "Processed" : "Pending",
      };
    });
  }

  return (membersRes.data ?? []).map((m) => {
    const basic = Number(m.base_salary_inr);
    const allowance = Number(m.allowances_inr);
    const ded = Number(m.deductions_inr);
    return {
      id: m.id,
      empId: m.employee_code,
      name: m.full_name,
      designation: m.designation,
      month: "November 2026",
      basic,
      hra: Math.round(basic * 0.25),
      allowance,
      pf: ded,
      tds: 0,
      pt: 200,
      netPay: Math.max(0, basic + allowance - ded),
      bankRef: `SAL-${m.employee_code}`,
      status: "Pending",
    };
  });
}

export async function getLiveExamsAction(): Promise<ExamItem[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin.from("exams").select("*").eq("school_id", schoolId).order("start_date", { ascending: false });
  return (data ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    type: e.term_name,
    classes: "All Active Grades",
    dateWindow: `${e.start_date} – ${e.end_date}`,
    marksLocked: e.status === "Published" ? "Locked" : "Editable",
    passingPct: 33,
    status: e.status === "Published" ? "Published" : e.status === "Ongoing" ? "Results Live" : "Draft",
  }));
}

export async function getLiveFeeTransactionsAction(): Promise<FeeTransaction[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const [rcpRes, stuRes] = await Promise.all([
    admin.from("fee_receipts").select("*, students(admission_no, full_name, section_name, school_classes(name))").eq("school_id", schoolId).order("paid_at", { ascending: false }).limit(100),
    admin.from("students").select("id, admission_no, full_name, section_name, fee_balance_inr, school_classes(name)").eq("school_id", schoolId).gt("fee_balance_inr", 0).is("deleted_at", null).limit(50),
  ]);

  const txns: FeeTransaction[] = (rcpRes.data ?? []).map((r) => {
    const stu = Array.isArray(r.students) ? r.students[0] : r.students;
    const cls = stu?.school_classes
      ? Array.isArray(stu.school_classes)
        ? stu.school_classes[0]
        : stu.school_classes
      : null;
    return {
      id: r.id,
      receiptNo: r.receipt_number,
      admissionId: stu?.admission_no ?? "ADM",
      studentName: stu?.full_name ?? "Student",
      className: `${cls?.name ?? "Class"}-${stu?.section_name ?? "A"}`,
      feeHead: "Academic Tuition & Fees",
      amount: Number(r.amount_inr) + Number(r.concession_inr),
      discount: Number(r.concession_inr),
      netPaid: Number(r.amount_inr),
      mode: r.payment_mode,
      date: new Date(r.paid_at).toLocaleDateString("en-IN"),
      status: "Paid",
    };
  });

  for (const d of stuRes.data ?? []) {
    const cls = Array.isArray(d.school_classes) ? d.school_classes[0] : d.school_classes;
    const amt = Number(d.fee_balance_inr);
    txns.push({
      id: d.id,
      receiptNo: `DUE-${d.admission_no}`,
      admissionId: d.admission_no,
      studentName: d.full_name,
      className: `${cls?.name ?? "Class"}-${d.section_name ?? "A"}`,
      feeHead: "Pending Fee Ledger Balance",
      amount: amt,
      discount: 0,
      netPaid: 0,
      mode: "Pending",
      date: "Current Term",
      status: amt > 15000 ? "Overdue" : "Due",
    });
  }
  return txns;
}

export async function getLiveBooksAction(): Promise<LibraryBook[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin.from("library_books").select("*").eq("school_id", schoolId).order("title");
  return (data ?? []).map((b) => ({
    id: b.id,
    accNo: b.accession_no,
    title: b.title,
    author: b.author,
    isbn: b.isbn,
    category: b.category,
    shelf: b.shelf_code || "Main Stack",
    available: b.available_copies,
    total: b.total_copies,
    status: b.available_copies <= 0 ? "All Issued" : b.available_copies <= 2 ? "Low Stock" : "Available",
  }));
}

export async function getLiveRoutesAction(): Promise<TransportRoute[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("transport_routes")
    .select("*, transport_vehicles(vehicle_no, driver_name, driver_phone, capacity, status)")
    .eq("school_id", schoolId);
  return (data ?? []).map((r) => {
    const v = Array.isArray(r.transport_vehicles) ? r.transport_vehicles[0] : r.transport_vehicles;
    return {
      id: r.id,
      code: r.route_code,
      title: r.name,
      coverage: r.stops.join(" -> "),
      stopsCount: r.stops.length,
      monthlyFee: Number(r.monthly_fee_inr),
      busNo: v?.vehicle_no ?? "Unassigned",
      driverName: v?.driver_name ?? "Driver",
      driverPhone: v?.driver_phone ?? "—",
      capacity: v?.capacity ?? 40,
      occupied: 0,
      status: v?.status === "Maintenance" ? "Maintenance" : "On Route",
    };
  });
}

export async function getLiveHostelRoomsAction(): Promise<HostelRoom[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin.from("hostel_rooms").select("*").eq("school_id", schoolId).order("room_no");
  return (data ?? []).map((hr) => ({
    id: hr.id,
    roomNo: hr.room_no,
    wing: hr.hostel_block,
    floor: "Main Wing",
    type: hr.room_type,
    occupied: hr.occupied,
    capacity: hr.capacity,
    monthlyFee: Number(hr.monthly_fee_inr),
    residents: [],
    status: hr.occupied >= hr.capacity ? "Full" : "Open",
  }));
}

export async function getLiveInventoryAction(): Promise<InventoryAsset[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin.from("inventory_items").select("*").eq("school_id", schoolId).order("name");
  return (data ?? []).map((i) => ({
    id: i.id,
    tag: i.sku,
    name: i.name,
    department: i.location,
    quantity: i.quantity,
    valueInr: i.quantity * Number(i.unit_cost_inr),
    condition: i.quantity <= i.reorder_level ? "Needs Repair" : "Good",
  }));
}

export async function getLiveAuditLogsAction(): Promise<AuditLogEntry[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("audit_logs")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map((a) => ({
    id: a.id,
    timestamp: new Date(a.created_at).toLocaleString("en-IN"),
    actor: a.actor_label,
    module: a.module,
    action: `${a.action} (${a.table_name})`,
    ip: a.ip_address || "127.0.0.1",
  }));
}

export async function getLiveNoticesAction(allowPublicFallback = false): Promise<NoticeItem[]> {
  const schoolId = await resolveScopeSchoolId(allowPublicFallback);
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("notices")
    .select("*")
    .eq("school_id", schoolId)
    .order("published_at", { ascending: false })
    .limit(50);
  return (data ?? []).map((n, idx) => ({
    id: n.id,
    title: n.title,
    audience: n.target_roles.join(", "),
    category: n.category === "Event" ? "Event" : n.category === "Exam" ? "Exam" : "Circular",
    date: new Date(n.published_at).toLocaleDateString("en-IN"),
    eventDate: new Date(n.published_at).toLocaleDateString("en-IN"),
    description: n.body,
    views: 0,
    status: idx === 0 ? "Pinned" : "Published",
  }));
}

export async function getLiveComplaintsAction(): Promise<ComplaintTicket[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("complaints")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((c, idx) => ({
    id: c.id,
    ticketNo: `CMP-${100 + idx}`,
    submittedBy: c.submitter_name,
    category: c.category,
    subject: c.subject,
    description: c.description,
    assignedTo: "Administration",
    status: c.status === "Resolved" ? "Resolved" : c.status === "In Review" ? "In Progress" : "Open",
  }));
}

export async function getLiveNotificationsAction(): Promise<NotificationItem[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("notifications")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    description: n.body,
    category: n.category === "Fees" ? "Fees" : n.category === "Academic" ? "Academic" : "System",
    time: new Date(n.created_at).toLocaleDateString("en-IN"),
    tag: n.category,
    tone: n.is_read ? "neutral" : "primary",
    unread: !n.is_read,
  }));
}

export async function getLiveMessagesAction(): Promise<MessageThread[]> {
  const schoolId = await resolveScopeSchoolId();
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("messages")
    .select("*")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false })
    .limit(30);

  return (data ?? []).map((m) => ({
    id: m.id,
    participant: m.sender_name,
    roleLabel: m.subject,
    preview: m.body.slice(0, 64),
    time: new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    unread: !m.is_read,
    messages: [
      {
        sender: m.sender_name,
        text: m.body,
        time: new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        self: false,
      },
    ],
  }));
}

export async function getLiveEventsAction(allowPublic = false) {
  const schoolId = await resolveScopeSchoolId(allowPublic);
  if (!schoolId) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("campus_events")
    .select("*")
    .eq("school_id", schoolId)
    .order("event_date", { ascending: true })
    .limit(50);
  return (data ?? []).map((ev) => ({
    id: ev.id,
    title: ev.title,
    description: ev.description,
    eventDate: ev.event_date,
    category: ev.category,
    location: ev.location,
  }));
}
