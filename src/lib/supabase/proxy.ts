import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { envPublic } from "@/lib/env.public";
import type { Database } from "@/types/db";
import type { UserRole } from "@/types/domain";

const PROTECTED_PREFIXES = [
  "/platform",
  "/admin",
  "/teacher",
  "/student",
  "/parent",
  "/notifications",
  "/account",
  "/search",
  "/help",
  "/status-errors",
];

const STAFF_SUBROLE_PREFIXES: Record<string, string[]> = {
  accountant: ["/admin/staff", "/admin/fees", "/admin/reports"],
  librarian: ["/admin/staff", "/admin/library"],
  transport: ["/admin/staff", "/admin/transport"],
  hostel: ["/admin/staff", "/admin/hostel"],
  receptionist: ["/admin/staff", "/admin/students", "/admin/communication"],
};

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isStaffAllowedAdminPath(pathname: string, subRole: string | undefined): boolean {
  const allowed = subRole ? STAFF_SUBROLE_PREFIXES[subRole] ?? ["/admin/staff"] : ["/admin/staff"];
  return allowed.some((prefix) => matchesPrefix(pathname, prefix));
}

function parseRole(raw: unknown): UserRole | null {
  if (
    raw === "super_admin" ||
    raw === "school_admin" ||
    raw === "principal" ||
    raw === "admin" ||
    raw === "teacher" ||
    raw === "student" ||
    raw === "parent" ||
    raw === "staff"
  ) {
    return raw;
  }
  return null;
}

function isSchoolAdmin(role: UserRole): boolean {
  return role === "school_admin" || role === "admin" || role === "principal";
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    envPublic.NEXT_PUBLIC_SUPABASE_URL,
    envPublic.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Always call getClaims() immediately after creating client to validate JWT & refresh session.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as
    | { sub?: string; app_metadata?: { role?: string; sub_role?: string; school_id?: string } }
    | undefined;

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!isProtected) {
    return supabaseResponse;
  }

  if (!claims?.sub) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Never trust user_metadata; read role only from signed app_metadata claim.
  const role = parseRole(claims.app_metadata?.role);
  if (!role) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  if (matchesPrefix(pathname, "/platform")) {
    if (role !== "super_admin") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
    if (pathname !== "/platform/mfa") {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData && aalData.nextLevel === "aal2" && aalData.currentLevel !== "aal2") {
        return NextResponse.redirect(new URL("/platform/mfa", request.url));
      }
    }
    return supabaseResponse;
  }

  // Enforce school lifecycle status (suspended/cancelled) & module feature flags for tenant routes
  if (role !== "super_admin" && !matchesPrefix(pathname, "/status-errors")) {
    const { data: schoolRow } = await supabase
      .from("schools")
      .select("status, enabled_modules")
      .limit(1)
      .maybeSingle();

    if (schoolRow && (schoolRow.status === "suspended" || schoolRow.status === "cancelled")) {
      return NextResponse.redirect(new URL("/status-errors?reason=suspended", request.url));
    }

    if (schoolRow?.enabled_modules && matchesPrefix(pathname, "/admin")) {
      const enabled = new Set(schoolRow.enabled_modules);
      const modulePrefixMap: Array<[string, string]> = [
        ["/admin/library", "library"],
        ["/admin/transport", "transport"],
        ["/admin/hostel", "hostel"],
        ["/admin/fees", "fees"],
        ["/admin/exams", "exams"],
        ["/admin/attendance", "attendance"],
        ["/admin/timetable", "timetable"],
        ["/admin/communication", "communication"],
        ["/admin/reports", "reports"],
      ];
      const blocked = modulePrefixMap.find(
        ([prefix, mod]) => matchesPrefix(pathname, prefix) && !enabled.has(mod),
      );
      if (blocked) {
        return NextResponse.redirect(new URL("/403", request.url));
      }
    }
  }

  // Super admin may view tenant portals ONLY during an active audited support session.
  let superAdminHasSupportSession = false;
  if (role === "super_admin") {
    const { data: activeSupport } = await supabase
      .from("support_sessions")
      .select("id")
      .eq("super_admin_id", claims.sub)
      .is("ended_at", null)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();
    superAdminHasSupportSession = Boolean(activeSupport?.id);
  }

  if (matchesPrefix(pathname, "/admin")) {
    if (isSchoolAdmin(role) || superAdminHasSupportSession) {
      return supabaseResponse;
    }
    if (role === "staff") {
      let subRole = claims.app_metadata?.sub_role;
      if (!subRole) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("sub_role")
          .eq("id", claims.sub)
          .maybeSingle();
        subRole = prof?.sub_role ?? undefined;
      }
      if (!isStaffAllowedAdminPath(pathname, subRole)) {
        return NextResponse.redirect(new URL("/403", request.url));
      }
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL("/403", request.url));
  }

  if (matchesPrefix(pathname, "/teacher") && role !== "teacher" && !isSchoolAdmin(role) && !superAdminHasSupportSession) {
    return NextResponse.redirect(new URL("/403", request.url));
  }
  if (matchesPrefix(pathname, "/student") && role !== "student" && !isSchoolAdmin(role) && !superAdminHasSupportSession) {
    return NextResponse.redirect(new URL("/403", request.url));
  }
  if (matchesPrefix(pathname, "/parent") && role !== "parent" && !isSchoolAdmin(role) && !superAdminHasSupportSession) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return supabaseResponse;
}
