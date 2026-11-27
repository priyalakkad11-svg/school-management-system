import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/login",
    "/forgot-password",
    "/otp-verification",
    "/reset-password",
    "/setup-password",
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
