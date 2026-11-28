import type { PortalLoginRole, SessionUser, UserRole } from "@/types/domain";

export const DEMO_SCHOOL_ID = "11111111-1111-4111-8111-111111111111";

export const SCHOOL_ADMIN_ROLES: readonly UserRole[] = [
  "school_admin",
  "admin",
  "principal",
];

export function isSchoolAdminRole(role: UserRole | string | null | undefined): boolean {
  return role === "school_admin" || role === "admin" || role === "principal";
}

export const ROLE_COOKIE_NAME = "educore_role";

export const ROLE_HOME: Record<UserRole, string> = {
  super_admin: "/platform",
  school_admin: "/admin",
  principal: "/admin",
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
  staff: "/admin/staff",
};

export const DEMO_USERS: Record<PortalLoginRole, SessionUser> = {
  admin: {
    id: "ADM-001",
    name: "Priya Lakkad",
    email: "priya.lakkad@greenwood.edu",
    role: "admin",
    initials: "PL",
    subtitle: "Super Admin",
  },
  teacher: {
    id: "TCH-042",
    name: "Mrs. Kavita Nair",
    email: "kavita.nair@greenwood.edu",
    role: "teacher",
    initials: "KN",
    subtitle: "Senior PGT Mathematics",
  },
  student: {
    id: "ADM-2026-0142",
    name: "Aarav Sharma",
    email: "aarav.sharma@student.greenwood.edu",
    role: "student",
    initials: "AS",
    subtitle: "Class 10-A • Roll #01",
  },
  parent: {
    id: "PAR-1042",
    name: "Mr. Rajesh Sharma",
    email: "rajesh.sharma@gmail.com",
    role: "parent",
    initials: "RS",
    subtitle: "Parent (Aarav & Diya)",
  },
  staff: {
    id: "STF-011",
    name: "Mohan Joshi",
    email: "mohan.joshi@greenwood.edu",
    role: "staff",
    initials: "MJ",
    subtitle: "Head Librarian & Ops",
  },
};

export function parseRoleCookie(val: string | undefined): UserRole | null {
  if (
    val === "super_admin" ||
    val === "school_admin" ||
    val === "principal" ||
    val === "admin" ||
    val === "teacher" ||
    val === "student" ||
    val === "parent" ||
    val === "staff"
  ) {
    return val;
  }
  return null;
}

