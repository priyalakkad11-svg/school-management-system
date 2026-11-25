import type { PortalRole } from "@/lib/routes";

export interface NavItemConfig {
  label: string;
  href: string;
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

export const ADMIN_NAV: NavItemConfig[] = [
  { label: "Dashboard", href: "/admin", iconName: "home" },
  { label: "School Setup", href: "/admin/setup/school-profile", iconName: "settings" },
  { label: "Students", href: "/admin/students", iconName: "users" },
  { label: "Teachers & Staff", href: "/admin/teachers", iconName: "briefcase" },
  { label: "Attendance", href: "/admin/attendance/students", iconName: "checkSquare" },
  { label: "Timetable", href: "/admin/timetable/classes", iconName: "calendar" },
  { label: "Exams & Results", href: "/admin/exams", iconName: "award" },
  { label: "Fees", href: "/admin/fees/structure", iconName: "creditCard" },
  { label: "Library", href: "/admin/library/books", iconName: "book" },
  { label: "Transport", href: "/admin/transport/routes", iconName: "bus" },
  { label: "Hostel", href: "/admin/hostel/rooms", iconName: "building" },
  { label: "Communication", href: "/admin/communication/notices", iconName: "mail" },
  { label: "Reports & Audit", href: "/admin/reports", iconName: "fileText" },
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

export function getNavForRole(role: PortalRole | "staff"): NavItemConfig[] {
  switch (role) {
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
