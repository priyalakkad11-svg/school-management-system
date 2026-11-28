import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { envPublic } from "@/lib/env.public";
import type { Database } from "@/types/db";
import type { UserRole } from "@/types/domain";

const PROTECTED_PREFIXES = [
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

function parseRole(raw: unknown): UserRole | null {
  if (
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
    | { sub?: string; app_metadata?: { role?: string } }
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

  if (pathname.startsWith("/admin") && role !== "admin" && role !== "staff") {
    return NextResponse.redirect(new URL("/403", request.url));
  }
  if (
    role === "staff" &&
    (pathname === "/admin" ||
      pathname.startsWith("/admin/setup") ||
      pathname.startsWith("/admin/audit-logs") ||
      pathname.startsWith("/admin/system-settings"))
  ) {
    return NextResponse.redirect(new URL("/403", request.url));
  }
  if (pathname.startsWith("/teacher") && role !== "teacher" && role !== "admin") {
    return NextResponse.redirect(new URL("/403", request.url));
  }
  if (pathname.startsWith("/student") && role !== "student" && role !== "admin") {
    return NextResponse.redirect(new URL("/403", request.url));
  }
  if (pathname.startsWith("/parent") && role !== "parent" && role !== "admin") {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return supabaseResponse;
}
