"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSchoolAdminRole, ROLE_HOME } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { checkAndConsumeRateLimit, resetRateLimitBucket } from "@/lib/rate-limit";
import {
  forgotPasswordSchema,
  loginSchema,
  otpSchema,
  resetPasswordSchema,
  setupPasswordSchema,
} from "@/schemas/domain";
import type { SessionUser, UserRole } from "@/types/domain";

export interface ActionResult<T = undefined> {
  ok: boolean;
  data?: T;
  error?: string;
}

const verifyOtpPayloadSchema = otpSchema.extend({
  email: z.string().email("Enter a valid email address"),
});

const setupAccountPayloadSchema = setupPasswordSchema.extend({
  identifier: z.string().min(3, "Enter your registered email or school ID"),
});

const updateAccountSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  preferredLanguage: z.enum(["en-IN", "en-US", "hi-IN"]),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

async function resolveEmailFromIdentifier(
  identifier: string,
  schoolCode?: string,
): Promise<string | null> {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }

  let parsedSchoolCode = schoolCode?.trim().toUpperCase() || "";
  let userCode = trimmed;
  const colonOrSlash = trimmed.match(/^([A-Za-z0-9]+)[:/](.+)$/);
  if (colonOrSlash) {
    parsedSchoolCode = colonOrSlash[1].toUpperCase();
    userCode = colonOrSlash[2].trim();
  }

  const admin = createAdminClient();
  if (parsedSchoolCode) {
    const { data: school } = await admin
      .from("schools")
      .select("id")
      .eq("school_code", parsedSchoolCode)
      .is("deleted_at", null)
      .maybeSingle();
    if (!school) return null;

    const { data: prof } = await admin
      .from("profiles")
      .select("email")
      .eq("school_id", school.id)
      .ilike("user_code", userCode)
      .is("deleted_at", null)
      .maybeSingle();
    return prof?.email ?? null;
  }

  const { data } = await admin
    .from("profiles")
    .select("email")
    .ilike("user_code", userCode)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  return data?.email ?? null;
}

function hashSecurityAnswer(answer: string): string {
  return crypto.createHash("sha256").update(answer.trim().toLowerCase()).digest("hex");
}

export async function getSchoolPublicBrandingAction(schoolCode?: string) {
  if (!schoolCode?.trim()) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("schools")
    .select("id, school_code, name, board, accent_color, logo_path, status")
    .eq("school_code", schoolCode.trim().toUpperCase())
    .is("deleted_at", null)
    .maybeSingle();
  return data ?? null;
}

export async function getShellTenantContextAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, school_id, sub_role")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!profile) return null;

  let activeSchoolId = profile.school_id;
  let supportSession: {
    id: string;
    schoolCode: string;
    schoolName: string;
    reason: string;
    readOnly: boolean;
  } | null = null;

  if (profile.role === "super_admin") {
    const { data: ss } = await admin
      .from("support_sessions")
      .select("id, school_id, reason, read_only, schools(school_code, name)")
      .eq("super_admin_id", user.id)
      .is("ended_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (ss) {
      activeSchoolId = ss.school_id;
      const sch = Array.isArray(ss.schools) ? ss.schools[0] : ss.schools;
      supportSession = {
        id: ss.id,
        schoolCode: sch?.school_code ?? "SCHOOL",
        schoolName: sch?.name ?? "School",
        reason: ss.reason,
        readOnly: ss.read_only,
      };
    }
  }

  const { data: school } = await admin
    .from("schools")
    .select("id, school_code, name, status, is_demo, enabled_modules, accent_color")
    .eq("id", activeSchoolId)
    .maybeSingle();

  return {
    role: profile.role,
    subRole: profile.sub_role,
    school: school
      ? {
          id: school.id,
          schoolCode: school.school_code,
          name: school.name,
          status: school.status,
          isDemo: school.is_demo,
          enabledModules: school.enabled_modules,
          accentColor: school.accent_color,
        }
      : null,
    supportSession,
  };
}

export async function signInAction(
  rawInput: z.input<typeof loginSchema>,
): Promise<ActionResult<{ user: SessionUser; redirectTo: string; mustChangePassword: boolean }>> {
  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid login details." };
  }

  const rateKey = `login:${parsed.data.schoolCode?.toUpperCase() || "ANY"}:${parsed.data.identifier.trim().toLowerCase()}`;
  const rate = await checkAndConsumeRateLimit({
    bucketKey: rateKey,
    maxAttempts: 8,
    windowMinutes: 15,
    lockMinutes: 15,
  });
  if (!rate.allowed) {
    return {
      ok: false,
      error: "Too many sign-in attempts. Please wait 15 minutes before trying again.",
    };
  }

  const email = await resolveEmailFromIdentifier(parsed.data.identifier, parsed.data.schoolCode);
  if (!email) {
    return { ok: false, error: "Invalid email/ID or password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { ok: false, error: "Invalid email/ID or password." };
  }

  await resetRateLimitBucket(rateKey);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, school_id, sub_role, user_code, full_name, email, role, subtitle, initials, status, must_change_password")
    .eq("id", data.user.id)
    .is("deleted_at", null)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut({ scope: "local" });
    return { ok: false, error: "Your school profile is unavailable. Contact an administrator." };
  }

  if (profile.status !== "Active") {
    await supabase.auth.signOut({ scope: "local" });
    return { ok: false, error: "Your account is currently suspended. Contact an administrator." };
  }

  const authoritativeRole = profile.role as UserRole;
  const portalTabMatch =
    authoritativeRole === parsed.data.role ||
    (parsed.data.role === "admin" && isSchoolAdminRole(authoritativeRole)) ||
    (parsed.data.role === "admin" && authoritativeRole === "super_admin");

  if (!portalTabMatch) {
    await supabase.auth.signOut({ scope: "local" });
    return {
      ok: false,
      error: `This account belongs to the ${authoritativeRole} portal. Select ${authoritativeRole} to sign in.`,
    };
  }

  // Record last login timestamp server-side
  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", data.user.id);

  const sessionUser: SessionUser = {
    id: profile.user_code ?? profile.id,
    name: profile.full_name,
    email: profile.email,
    role: authoritativeRole,
    initials: profile.initials,
    subtitle: profile.subtitle || authoritativeRole,
    schoolId: profile.school_id,
    subRole: (profile.sub_role as SessionUser["subRole"]) ?? null,
  };

  return {
    ok: true,
    data: {
      user: sessionUser,
      redirectTo: profile.must_change_password ? "/setup-password" : ROLE_HOME[authoritativeRole],
      mustChangePassword: profile.must_change_password,
    },
  };
}

export async function signOutAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) {
    return { ok: false, error: getErrorMessage(error, "Failed to sign out.") };
  }
  return { ok: true };
}

export async function sendRecoveryOtpAction(
  rawInput: z.input<typeof forgotPasswordSchema>,
): Promise<ActionResult<{ email: string }>> {
  const parsed = forgotPasswordSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid recovery input." };
  }

  const email = await resolveEmailFromIdentifier(parsed.data.contact);
  if (!email) {
    return { ok: false, error: "Enter a registered portal email address or school ID." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to dispatch verification OTP.") };
  }

  return { ok: true, data: { email } };
}

export async function verifyOtpAction(
  rawInput: z.input<typeof verifyOtpPayloadSchema>,
): Promise<ActionResult> {
  const parsed = verifyOtpPayloadSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid OTP code." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.otp,
    type: "email",
  });

  if (error) {
    return { ok: false, error: getErrorMessage(error, "Invalid or expired verification code.") };
  }

  return { ok: true };
}

export async function resetPasswordAction(
  rawInput: z.input<typeof resetPasswordSchema>,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid password." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Your recovery session has expired. Request a new OTP." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { ok: false, error: getErrorMessage(error, "Unable to update password.") };
  }

  await supabase.from("profiles").update({ must_change_password: false }).eq("id", user.id);
  return { ok: true };
}

export async function setupPasswordAction(
  rawInput: z.input<typeof setupAccountPayloadSchema>,
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = setupAccountPayloadSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid setup inputs." };
  }

  const supabase = await createClient();
  let email = await resolveEmailFromIdentifier(parsed.data.identifier);

  if (!email) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  }

  if (!email) {
    return { ok: false, error: "Enter a valid registered email or school ID." };
  }

  const { data: signedIn, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.tempPassword,
  });

  if (signInErr || !signedIn.user) {
    return { ok: false, error: "Current temporary password is incorrect." };
  }

  const { error: updateErr } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });
  if (updateErr) {
    return { ok: false, error: getErrorMessage(updateErr, "Unable to activate account password.") };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .update({
      must_change_password: false,
      security_question: parsed.data.securityQuestion,
      security_answer_hash: hashSecurityAnswer(parsed.data.securityAnswer),
    })
    .eq("id", signedIn.user.id)
    .select("role")
    .single();

  const role = (profile?.role as UserRole | undefined) ?? "student";
  return { ok: true, data: { redirectTo: ROLE_HOME[role] } };
}

export async function updateAccountAction(
  rawInput: z.input<typeof updateAccountSchema>,
): Promise<ActionResult<SessionUser>> {
  const parsed = updateAccountSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid profile update." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Please sign in to update your account settings." };
  }

  if (parsed.data.newPassword && parsed.data.newPassword.trim().length > 0) {
    if (parsed.data.newPassword.length < 8) {
      return { ok: false, error: "New password must be at least 8 characters." };
    }
    if (!parsed.data.currentPassword || !user.email) {
      return { ok: false, error: "Enter your current password to set a new password." };
    }
    const { error: reauthErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword,
    });
    if (reauthErr) {
      return { ok: false, error: "Current password is incorrect." };
    }
    const { error: pwErr } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });
    if (pwErr) {
      return { ok: false, error: getErrorMessage(pwErr, "Failed to update password.") };
    }
  }

  const initials = parsed.data.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "EC";

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName.trim(),
      phone: parsed.data.phone?.trim() || null,
      preferred_language: parsed.data.preferredLanguage,
      initials,
    })
    .eq("id", user.id)
    .select("id, user_code, full_name, email, role, subtitle, initials")
    .single();

  if (error || !updated) {
    return { ok: false, error: getErrorMessage(error, "Unable to save profile changes.") };
  }

  return {
    ok: true,
    data: {
      id: updated.user_code ?? updated.id,
      name: updated.full_name,
      email: updated.email,
      role: updated.role as UserRole,
      initials: updated.initials,
      subtitle: updated.subtitle,
    },
  };
}
