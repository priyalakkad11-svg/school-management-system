import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSchoolAdminRole } from "@/lib/auth";
import type { UserRole } from "@/types/domain";

export interface TenantSessionContext {
  userId: string;
  userName: string;
  email: string;
  role: UserRole;
  subRole: string | null;
  schoolId: string;
  schoolCode: string;
  schoolName: string;
  schoolStatus: string;
  readOnly: boolean;
  isSupportSession: boolean;
}

export async function getTenantSession(): Promise<TenantSessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: prof } = await admin
    .from("profiles")
    .select("id, full_name, email, role, sub_role, school_id, status, deleted_at")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!prof || prof.status !== "Active") return null;

  let activeSchoolId = prof.school_id;
  let supportReadOnly = false;
  let isSupportSession = false;

  if (prof.role === "super_admin") {
    const { data: ss } = await admin
      .from("support_sessions")
      .select("school_id, read_only")
      .eq("super_admin_id", user.id)
      .is("ended_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!ss) return null;
    activeSchoolId = ss.school_id;
    supportReadOnly = ss.read_only;
    isSupportSession = true;
  }

  const { data: school } = await admin
    .from("schools")
    .select("id, school_code, name, status")
    .eq("id", activeSchoolId)
    .maybeSingle();

  if (!school) return null;

  const lifecycleBlocked =
    school.status === "read_only" ||
    school.status === "suspended" ||
    school.status === "cancelled";

  return {
    userId: prof.id,
    userName: prof.full_name,
    email: prof.email,
    role: prof.role as UserRole,
    subRole: prof.sub_role,
    schoolId: school.id,
    schoolCode: school.school_code,
    schoolName: school.name,
    schoolStatus: school.status,
    readOnly: lifecycleBlocked || supportReadOnly,
    isSupportSession,
  };
}

export async function requireTenantWrite(
  allowed: "admin_only" | "staff_or_admin" | "teacher_or_admin" | "any_auth" = "staff_or_admin",
) {
  const ctx = await getTenantSession();
  if (!ctx) return { ctx: null, admin: null, error: "Authentication required." };
  if (ctx.readOnly) {
    return {
      ctx: null,
      admin: null,
      error: ctx.isSupportSession
        ? "Support session is Read-Only. Start a write-enabled support session to mutate records."
        : `School workspace is in ${ctx.schoolStatus} mode — writes paused.`,
    };
  }

  const isAdmin = isSchoolAdminRole(ctx.role);
  if (allowed === "admin_only" && !isAdmin) {
    return { ctx: null, admin: null, error: "School Administrator privileges required." };
  }
  if (allowed === "staff_or_admin" && !isAdmin && ctx.role !== "staff") {
    return { ctx: null, admin: null, error: "Staff or Administrator privileges required." };
  }
  if (allowed === "teacher_or_admin" && !isAdmin && ctx.role !== "teacher") {
    return { ctx: null, admin: null, error: "Teacher or Administrator privileges required." };
  }

  return { ctx, admin: createAdminClient(), error: null };
}
