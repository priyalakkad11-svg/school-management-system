import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseRoleCookie, ROLE_COOKIE_NAME } from "@/lib/auth";

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const role = parseRoleCookie(request.cookies.get(ROLE_COOKIE_NAME)?.value);
  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && role !== "admin" && role !== "staff") {
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/parent/:path*",
    "/notifications/:path*",
    "/account/:path*",
    "/search/:path*",
    "/help/:path*",
    "/status-errors/:path*",
  ],
};

