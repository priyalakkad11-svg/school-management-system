import type { PortalRole } from "@/lib/routes";

export interface NavItemConfig {
  label: string;
  href: string;
  moduleKey?: string;
  iconName:
    | "home"
    | "settings"
    | "users"
    | "briefcase"
    | "checkSquare"
    | "calendar"
    | "award"
    | "creditCard"
    | "book"
    | "bus"
    | "building"
    | "mail"
    | "fileText"
    | "user"
    | "bell"
    | "help";
}

export const PLATFORM_NAV: NavItemConfig[] = [
  { label: "Platform Dashboard", href: "/platform", iconName: "home" },
  { label: "Schools Directory", href: "/platform/schools", iconName: "building" },
  { label: "Create School", href: "/platform/schools/new", iconName: "briefcase" },
  { label: "Plans & Pricing", href: "/platform/plans", iconName: "award" },
  { label: "Subscriptions", href: "/platform/subscriptions", iconName: "calendar" },
  { label: "Invoices & Payments", href: "/platform/invoices", iconName: "creditCard" },
  { label: "Announcements", href: "/platform/announcements", iconName: "bell" },
  { label: "Support Tickets", href: "/platform/tickets", iconName: "help" },
  { label: "Platform Audit Logs", href: "/platform/audit-logs", iconName: "fileText" },
  { label: "Settings & Demo", href: "/platform/settings", iconName: "settings" },
];

export const ADMIN_NAV: NavItemConfig[] = [
  { label: "Dashboard", href: "/admin", iconName: "home" },
  { label: "School Setup", href: "/admin/setup/school-profile", moduleKey: "setup", iconName: "settings" },
  { label: "Students", href: "/admin/students", moduleKey: "students", iconName: "users" },
  { label: "Teachers & Staff", href: "/admin/teachers", moduleKey: "teachers", iconName: "briefcase" },
  { label: "Attendance", href: "/admin/attendance/students", moduleKey: "attendance", iconName: "checkSquare" },
  { label: "Timetable", href: "/admin/timetable/classes", moduleKey: "timetable", iconName: "calendar" },
  { label: "Exams & Results", href: "/admin/exams", moduleKey: "exams", iconName: "award" },
  { label: "Fees", href: "/admin/fees/structure", moduleKey: "fees", iconName: "creditCard" },
  { label: "Library", href: "/admin/library/books", moduleKey: "library", iconName: "book" },
  { label: "Transport", href: "/admin/transport/routes", moduleKey: "transport", iconName: "bus" },
  { label: "Hostel", href: "/admin/hostel/rooms", moduleKey: "hostel", iconName: "building" },
  { label: "Communication", href: "/admin/communication/notices", moduleKey: "communication", iconName: "mail" },
  { label: "Reports & Audit", href: "/admin/reports", moduleKey: "reports", iconName: "fileText" },
];

export const TEACHER_NAV: NavItemConfig[] = [
  { label: "Dashboard", href: "/teacher", iconName: "home" },
  { label: "My Classes", href: "/teacher/classes", iconName: "book" },
  { label: "Mark Attendance", href: "/teacher/attendance", iconName: "checkSquare" },
  { label: "My Timetable", href: "/teacher/timetable", iconName: "calendar" },
  { label: "Assignments", href: "/teacher/assignments", iconName: "fileText" },
  { label: "Study Material", href: "/teacher/study-material", iconName: "book" },
  { label: "Marks Entry", href: "/teacher/marks-entry", iconName: "award" },
  { label: "Students", href: "/teacher/students", iconName: "users" },
  { label: "Apply Leave", href: "/teacher/leave", iconName: "calendar" },
  { label: "Messages", href: "/teacher/messages", iconName: "mail" },
  { label: "My Profile", href: "/teacher/profile", iconName: "user" },
];

export const STUDENT_NAV: NavItemConfig[] = [
  { label: "Dashboard", href: "/student", iconName: "home" },
  { label: "My Profile", href: "/student/profile", iconName: "user" },
  { label: "My Attendance", href: "/student/attendance", iconName: "checkSquare" },
  { label: "Timetable", href: "/student/timetable", iconName: "calendar" },
  { label: "Homework", href: "/student/homework", iconName: "fileText" },
  { label: "Study Material", href: "/student/study-material", iconName: "book" },
  { label: "Exam Schedule", href: "/student/exams", iconName: "calendar" },
  { label: "Results", href: "/student/results", iconName: "award" },
  { label: "Fees", href: "/student/fees", iconName: "creditCard" },
  { label: "Library", href: "/student/library", iconName: "book" },
  { label: "Notices & Events", href: "/student/notices", iconName: "bell" },
  { label: "Messages", href: "/student/messages", iconName: "mail" },
];

export const PARENT_NAV: NavItemConfig[] = [
  { label: "Dashboard", href: "/parent", iconName: "home" },
  { label: "Child Switcher", href: "/parent/children", iconName: "users" },
  { label: "Child Attendance", href: "/parent/attendance", iconName: "checkSquare" },
  { label: "Child Results", href: "/parent/results", iconName: "award" },
  { label: "Fees & Payment", href: "/parent/fees", iconName: "creditCard" },
  { label: "Homework Status", href: "/parent/homework", iconName: "fileText" },
  { label: "Teacher Messages", href: "/parent/messages", iconName: "mail" },
  { label: "Notices & Events", href: "/parent/notices", iconName: "bell" },
  { label: "Apply Leave", href: "/parent/leave", iconName: "calendar" },
];

export function getNavForRole(role: PortalRole | "staff" | "super_admin"): NavItemConfig[] {
  switch (role) {
    case "super_admin":
      return PLATFORM_NAV;
    case "teacher":
      return TEACHER_NAV;
    case "student":
      return STUDENT_NAV;
    case "parent":
      return PARENT_NAV;
    case "admin":
    case "staff":
    default:
      return ADMIN_NAV;
  }
}
