import type { SessionUser, UserRole } from "@/types/domain";

export const ROLE_COOKIE_NAME = "educore_role";

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
  staff: "/admin/staff",
};

export const DEMO_USERS: Record<UserRole, SessionUser> = {
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

