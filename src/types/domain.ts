export type PortalLoginRole = "admin" | "teacher" | "student" | "parent" | "staff";

export type UserRole =
  | "super_admin"
  | "school_admin"
  | "principal"
  | PortalLoginRole;

export type StaffSubRole =
  | "accountant"
  | "librarian"
  | "transport"
  | "hostel"
  | "receptionist";

export type StatusTone = "success" | "warning" | "danger" | "info" | "primary" | "neutral";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  subtitle: string;
  schoolId?: string;
  subRole?: StaffSubRole | null;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  studentsCount: number;
  status: "Active" | "Upcoming" | "Archived";
}

export interface SchoolClass {
  id: string;
  name: string;
  gradeOrder: number;
  wing: string;
  sections: string[];
  classTeachers: string;
  strength: number;
  capacity: number;
  roomBlock: string;
  status: "Active" | "Inactive";
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: string;
  maxTheory: number;
  maxPractical: number;
  periodsPerWeek: number;
  status: "Active" | "Inactive";
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  twoFactor: boolean;
  status: "Active" | "Suspended";
}

export interface Student {
  id: string;
  admissionId: string;
  rollNo: string;
  name: string;
  className: string;
  section: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string;
  house: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  transportRoute: string;
  attendancePct: number;
  termAvgPct: number;
  feeStatus: "Paid" | "Due" | "Overdue";
  feeDueAmount: number;
  status: "Active" | "Transferred";
}

export interface AdmissionEnquiry {
  id: string;
  enquiryNo: string;
  childName: string;
  applyingClass: string;
  parentName: string;
  parentPhone: string;
  source: string;
  stage: "Tour Scheduled" | "Form Submitted" | "Follow-up Due" | "Enrolled" | "Rejected";
  score?: number;
  notes?: string;
}

export interface Teacher {
  id: string;
  empId: string;
  name: string;
  department: string;
  designation: string;
  qualification: string;
  classesAssigned: string;
  periodsPerWeek: number;
  email: string;
  phone: string;
  salaryGross: number;
  joinDate: string;
  status: "Active" | "On Leave";
}

export interface StaffMember {
  id: string;
  empId: string;
  name: string;
  role: string;
  department: string;
  shift: string;
  phone: string;
  salary: number;
  status: "Active" | "On Leave";
}

export interface LeaveRequest {
  id: string;
  applicantName: string;
  applicantRole: "Teacher" | "Staff" | "Student";
  classOrDept: string;
  leaveType: string;
  dates: string;
  days: number;
  substitute?: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface PayrollRecord {
  id: string;
  empId: string;
  name: string;
  designation: string;
  month: string;
  basic: number;
  hra: number;
  allowance: number;
  pf: number;
  tds: number;
  pt: number;
  netPay: number;
  bankRef: string;
  status: "Processed" | "Pending";
}

export interface ExamItem {
  id: string;
  name: string;
  type: string;
  classes: string;
  dateWindow: string;
  marksLocked: string;
  passingPct: number;
  status: "Published" | "Results Live" | "Draft";
}

export interface FeeTransaction {
  id: string;
  receiptNo: string;
  admissionId: string;
  studentName: string;
  className: string;
  feeHead: string;
  amount: number;
  discount: number;
  netPaid: number;
  mode: string;
  date: string;
  status: "Paid" | "Due" | "Overdue";
}

export interface LibraryBook {
  id: string;
  accNo: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  shelf: string;
  available: number;
  total: number;
  status: "Available" | "Low Stock" | "All Issued";
}

export interface TransportRoute {
  id: string;
  code: string;
  title: string;
  coverage: string;
  stopsCount: number;
  monthlyFee: number;
  busNo: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  occupied: number;
  status: "On Route" | "Parked" | "Maintenance";
}

export interface HostelRoom {
  id: string;
  roomNo: string;
  wing: string;
  floor: string;
  type: string;
  occupied: number;
  capacity: number;
  monthlyFee: number;
  residents: string[];
  status: "Open" | "Full";
}

export interface NoticeItem {
  id: string;
  title: string;
  audience: string;
  category: "Academic" | "Exam" | "Event" | "Circular" | "PTM" | "Finance";
  date: string;
  eventDate?: string;
  description: string;
  views: number;
  status: "Published" | "Pinned";
}

export interface MessageThread {
  id: string;
  participant: string;
  roleLabel: string;
  preview: string;
  time: string;
  unread: boolean;
  messages: { sender: string; text: string; time: string; self: boolean }[];
}

export interface ComplaintTicket {
  id: string;
  ticketNo: string;
  submittedBy: string;
  category: string;
  subject: string;
  description: string;
  assignedTo: string;
  status: "Open" | "In Progress" | "Resolved";
}

export interface InventoryAsset {
  id: string;
  tag: string;
  name: string;
  department: string;
  quantity: number;
  valueInr: number;
  condition: "Good" | "Needs Repair";
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  module: string;
  action: string;
  ip: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: "Fees" | "Academic" | "Transport" | "HR" | "System";
  time: string;
  tag: string;
  tone: StatusTone;
  unread: boolean;
}

