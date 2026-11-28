"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getErrorMessage } from "@/lib/errors";
import {
  calculateProration,
  calculateSaaSPrice,
  getIndianFinancialYear,
  type PricingSlab,
} from "@/lib/saas-pricing";
import { DEMO_SCHOOL_ID } from "@/lib/auth";
import type { ActionResult } from "@/app/actions/auth.actions";
import type { Json } from "@/types/db";

const ALL_SCHOOL_MODULES = [
  "setup",
  "students",
  "teachers",
  "staff",
  "attendance",
  "timetable",
  "exams",
  "fees",
  "library",
  "transport",
  "hostel",
  "communication",
  "reports",
  "inventory",
  "documents",
] as const;

export type SchoolLifecycleStatus =
  | "trial"
  | "active"
  | "past_due"
  | "read_only"
  | "suspended"
  | "cancelled";

export interface PlatformDashboardDto {
  metrics: {
    activeSchools: number;
    trialSchools: number;
    suspendedSchools: number;
    totalRealSchools: number;
    totalRealStudents: number;
    mrrInr: number;
    arrInr: number;
    renewalsDue30d: number;
  };
  recentSignups: Array<{
    id: string;
    schoolCode: string;
    name: string;
    board: string;
    status: SchoolLifecycleStatus;
    isDemo: boolean;
    createdAt: string;
    planName: string;
    monthlyRateInr: number;
  }>;
  renewalsDue: Array<{
    schoolId: string;
    schoolCode: string;
    schoolName: string;
    planName: string;
    periodEnd: string;
    monthlyRateInr: number;
    status: string;
  }>;
  openTicketsCount: number;
}

export interface PlatformSchoolListItem {
  id: string;
  schoolCode: string;
  name: string;
  board: string;
  contactEmail: string;
  contactPhone: string;
  status: SchoolLifecycleStatus;
  isDemo: boolean;
  planName: string;
  billingCycle: "monthly" | "yearly";
  monthlyRateInr: number;
  studentsCount: number;
  maxStudents: number;
  createdAt: string;
}

export interface HandoverCredentialsDto {
  schoolId: string;
  schoolCode: string;
  schoolName: string;
  board: string;
  adminName: string;
  adminEmail: string;
  loginId: string;
  tempPassword: string;
  planName: string;
  billingCycle: "monthly" | "yearly";
  totalPayableInr: number;
  invoiceNumber: string | null;
  trialEndsAt: string | null;
  loginUrl: string;
  micrositeUrl: string;
}

export interface SaasPlanDto {
  id: string;
  code: string;
  name: string;
  description: string;
  yearlyDiscountPct: number;
  setupFeeInr: number;
  gstPct: number;
  maxStudents: number;
  maxTeachers: number;
  maxStaff: number;
  maxStorageMb: number;
  enabledModules: string[];
  slabs: PricingSlab[];
  isActive: boolean;
}

export interface SchoolUsageDto {
  studentsCount: number;
  teachersCount: number;
  staffCount: number;
  usersCount: number;
  storageMb: number;
  maxStudents: number;
  maxTeachers: number;
  maxStaff: number;
  maxStorageMb: number;
  warn80: boolean;
  blocked100: boolean;
}

async function requireSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { admin: null, user: null, error: "Sign in as Super Admin to continue." };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, status, deleted_at, full_name")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!profile || profile.role !== "super_admin" || profile.status !== "Active") {
    return { admin: null, user: null, error: "Platform Super Admin authorization required." };
  }

  return { admin, user, profile, error: null };
}

function parseSlabs(raw: Json): PricingSlab[] {
  if (!Array.isArray(raw)) {
    return [{ min: 1, max: null, price_per_student_month: 49 }];
  }
  const parsed: PricingSlab[] = [];
  for (const item of raw) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const obj = item as Record<string, unknown>;
      const min = Number(obj.min ?? 1);
      const max = obj.max === null || obj.max === undefined ? null : Number(obj.max);
      const price = Number(obj.price_per_student_month ?? 45);
      if (Number.isFinite(min) && Number.isFinite(price)) {
        parsed.push({
          min,
          max: max !== null && Number.isFinite(max) ? max : null,
          price_per_student_month: price,
        });
      }
    }
  }
  return parsed.length > 0 ? parsed : [{ min: 1, max: null, price_per_student_month: 49 }];
}

function generateClassListFromPreset(preset: string, customGrades?: string): Array<{
  name: string;
  gradeOrder: number;
  wing: string;
}> {
  if (preset === "custom" && customGrades?.trim()) {
    return customGrades
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name, idx) => ({
        name,
        gradeOrder: idx + 1,
        wing: idx < 3 ? "Pre-Primary" : idx < 8 ? "Primary" : "Secondary",
      }));
  }
  if (preset === "1-10" || preset === "1-12") {
    const end = preset === "1-12" ? 12 : 10;
    return Array.from({ length: end }, (_, i) => {
      const grade = i + 1;
      return {
        name: `Grade ${grade}`,
        gradeOrder: grade,
        wing: grade <= 5 ? "Primary" : grade <= 8 ? "Middle" : "Senior",
      };
    });
  }
  // Default: Nursery, LKG, UKG, Grade 1-12
  const prePrimary = [
    { name: "Nursery", gradeOrder: -2, wing: "Pre-Primary" },
    { name: "LKG", gradeOrder: -1, wing: "Pre-Primary" },
    { name: "UKG", gradeOrder: 0, wing: "Pre-Primary" },
  ];
  const grades = Array.from({ length: 12 }, (_, i) => {
    const g = i + 1;
    return {
      name: `Grade ${g}`,
      gradeOrder: g,
      wing: g <= 5 ? "Primary" : g <= 8 ? "Middle" : "Senior",
    };
  });
  return [...prePrimary, ...grades];
}

// ---------- Screen 111: Platform Dashboard ----------

export async function getPlatformDashboardAction(): Promise<ActionResult<PlatformDashboardDto>> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const [metricsRes, schoolsRes, subsRes, ticketsRes] = await Promise.all([
    auth.admin.rpc("get_platform_dashboard_metrics"),
    auth.admin
      .from("schools")
      .select("id, school_code, name, board, status, is_demo, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(12),
    auth.admin
      .from("school_subscriptions")
      .select("school_id, status, current_period_end, monthly_rate_inr, saas_plans(name), schools!inner(id, school_code, name, is_demo, deleted_at)")
      .is("schools.deleted_at", null),
    auth.admin
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]),
  ]);

  const rawM = metricsRes.data?.[0];
  const subBySchool = new Map<string, { planName: string; monthlyRateInr: number }>();
  const renewalsDue: PlatformDashboardDto["renewalsDue"] = [];
  const in30Days = Date.now() + 30 * 86_400_000;

  for (const row of subsRes.data ?? []) {
    const planObj = Array.isArray(row.saas_plans) ? row.saas_plans[0] : row.saas_plans;
    const schoolObj = Array.isArray(row.schools) ? row.schools[0] : row.schools;
    const planName = planObj?.name ?? "Standard";
    subBySchool.set(row.school_id, {
      planName,
      monthlyRateInr: Number(row.monthly_rate_inr ?? 0),
    });

    if (
      schoolObj &&
      !schoolObj.is_demo &&
      row.current_period_end &&
      new Date(row.current_period_end).getTime() <= in30Days
    ) {
      renewalsDue.push({
        schoolId: schoolObj.id,
        schoolCode: schoolObj.school_code,
        schoolName: schoolObj.name,
        planName,
        periodEnd: row.current_period_end,
        monthlyRateInr: Number(row.monthly_rate_inr ?? 0),
        status: row.status,
      });
    }
  }

  return {
    ok: true,
    data: {
      metrics: {
        activeSchools: Number(rawM?.active_schools ?? 0),
        trialSchools: Number(rawM?.trial_schools ?? 0),
        suspendedSchools: Number(rawM?.suspended_schools ?? 0),
        totalRealSchools: Number(rawM?.total_real_schools ?? 0),
        totalRealStudents: Number(rawM?.total_real_students ?? 0),
        mrrInr: Number(rawM?.mrr_inr ?? 0),
        arrInr: Number(rawM?.arr_inr ?? 0),
        renewalsDue30d: Number(rawM?.renewals_due_30d ?? 0),
      },
      recentSignups: (schoolsRes.data ?? []).map((s) => {
        const sub = subBySchool.get(s.id);
        return {
          id: s.id,
          schoolCode: s.school_code,
          name: s.name,
          board: s.board,
          status: s.status as SchoolLifecycleStatus,
          isDemo: s.is_demo,
          createdAt: s.created_at,
          planName: sub?.planName ?? "Unassigned",
          monthlyRateInr: sub?.monthlyRateInr ?? 0,
        };
      }),
      renewalsDue,
      openTicketsCount: ticketsRes.count ?? 0,
    },
  };
}

// ---------- Screen 112: Schools Directory ----------

export async function listPlatformSchoolsAction(params?: {
  search?: string;
  status?: string;
}): Promise<ActionResult<PlatformSchoolListItem[]>> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  let query = auth.admin
    .from("schools")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (params?.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }
  if (params?.search?.trim()) {
    const q = params.search.trim();
    query = query.or(`name.ilike.%${q}%,school_code.ilike.%${q}%,contact_email.ilike.%${q}%`);
  }

  const { data: schools, error } = await query;
  if (error) return { ok: false, error: getErrorMessage(error, "Unable to load schools.") };

  const [{ data: subs }, { data: studentRows }] = await Promise.all([
    auth.admin
      .from("school_subscriptions")
      .select("school_id, billing_cycle, monthly_rate_inr, saas_plans(name, max_students)"),
    auth.admin
      .from("profiles")
      .select("school_id")
      .eq("role", "student")
      .is("deleted_at", null),
  ]);

  const studentCounts = new Map<string, number>();
  for (const r of studentRows ?? []) {
    studentCounts.set(r.school_id, (studentCounts.get(r.school_id) ?? 0) + 1);
  }
  const subMap = new Map<string, { planName: string; cycle: "monthly" | "yearly"; mrr: number; maxStudents: number }>();
  for (const sub of subs ?? []) {
    const p = Array.isArray(sub.saas_plans) ? sub.saas_plans[0] : sub.saas_plans;
    subMap.set(sub.school_id, {
      planName: p?.name ?? "Standard",
      cycle: sub.billing_cycle === "monthly" ? "monthly" : "yearly",
      mrr: Number(sub.monthly_rate_inr ?? 0),
      maxStudents: Number(p?.max_students ?? 500),
    });
  }

  return {
    ok: true,
    data: (schools ?? []).map((s) => {
      const sub = subMap.get(s.id);
      return {
        id: s.id,
        schoolCode: s.school_code,
        name: s.name,
        board: s.board,
        contactEmail: s.contact_email,
        contactPhone: s.contact_phone,
        status: s.status as SchoolLifecycleStatus,
        isDemo: s.is_demo,
        planName: sub?.planName ?? "Custom",
        billingCycle: sub?.cycle ?? "yearly",
        monthlyRateInr: sub?.mrr ?? 0,
        studentsCount: studentCounts.get(s.id) ?? 0,
        maxStudents: sub?.maxStudents ?? 500,
        createdAt: s.created_at,
      };
    }),
  };
}

export async function updateSchoolLifecycleAction(params: {
  schoolId: string;
  status: SchoolLifecycleStatus;
  reason?: string;
}): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { data: school } = await auth.admin
    .from("schools")
    .select("id, school_code, status, contact_email")
    .eq("id", params.schoolId)
    .single();
  if (!school) return { ok: false, error: "School not found." };

  const [{ error: schErr }, { error: subErr }] = await Promise.all([
    auth.admin.from("schools").update({ status: params.status }).eq("id", params.schoolId),
    auth.admin
      .from("school_subscriptions")
      .update({ status: params.status })
      .eq("school_id", params.schoolId),
  ]);

  if (schErr || subErr) {
    return { ok: false, error: getErrorMessage(schErr ?? subErr, "Failed updating school status.") };
  }

  if (params.status === "suspended" || params.status === "read_only") {
    await auth.admin.from("saas_notification_log").insert({
      school_id: params.schoolId,
      event_type: "suspension",
      recipient_email: school.contact_email || "admin@school.local",
      status: "queued",
      payload: {
        previousStatus: school.status,
        nextStatus: params.status,
        reason: params.reason ?? "Updated by Super Admin",
      },
    });
  }

  revalidatePath("/platform");
  revalidatePath("/platform/schools");
  revalidatePath(`/platform/schools/${params.schoolId}`);
  return { ok: true };
}

// ---------- Screen 113: Atomic Create School Wizard ----------

const createSchoolSchema = z.object({
  schoolCode: z
    .string()
    .trim()
    .min(3)
    .max(12)
    .regex(/^[A-Za-z0-9]+$/, "Use only letters & numbers for School Code")
    .optional(),
  name: z.string().trim().min(3, "School name is required"),
  board: z.string().trim().min(2).default("CBSE"),
  address: z.string().trim().default(""),
  contactEmail: z.string().trim().email("Valid school contact email required"),
  contactPhone: z.string().trim().min(7, "Contact phone required"),
  accentColor: z.string().trim().default("indigo"),
  timezone: z.string().trim().default("Asia/Kolkata"),
  academicYearName: z.string().trim().min(4).default("2026-27"),
  academicYearStart: z.string().default("2026-04-01"),
  academicYearEnd: z.string().default("2027-03-31"),
  gradePreset: z.enum(["nursery-12", "1-12", "1-10", "custom"]).default("nursery-12"),
  customGrades: z.string().optional(),
  sectionsCsv: z.string().default("A, B"),
  planId: z.string().uuid("Select a valid SaaS plan"),
  billingCycle: z.enum(["monthly", "yearly"]).default("yearly"),
  studentCountTier: z.number().int().min(10).max(50000).default(250),
  startAsTrial: z.boolean().default(false),
  includeSetupFee: z.boolean().default(true),
  couponCode: z.string().trim().optional(),
  adminName: z.string().trim().min(2, "Admin full name required"),
  adminEmail: z.string().trim().email("Valid School Admin email required"),
  adminPhone: z.string().trim().optional(),
});

export async function createSchoolAtomicAction(
  raw: z.input<typeof createSchoolSchema>,
): Promise<ActionResult<HandoverCredentialsDto>> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const parsed = createSchoolSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid school wizard data." };
  }
  const d = parsed.data;

  const autoCodeBase = d.name
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(3, "S");
  const schoolCode = (
    d.schoolCode?.trim() || `${autoCodeBase}${Math.floor(10 + Math.random() * 89)}`
  ).toUpperCase();

  const { data: dupSchool } = await auth.admin
    .from("schools")
    .select("id")
    .eq("school_code", schoolCode)
    .maybeSingle();
  if (dupSchool) {
    return { ok: false, error: `School code ${schoolCode} already exists. Choose another.` };
  }

  const [{ data: plan }, { data: platformCfg }] = await Promise.all([
    auth.admin.from("saas_plans").select("*").eq("id", d.planId).single(),
    auth.admin.from("platform_settings").select("*").eq("singleton_key", "default").single(),
  ]);
  if (!plan) return { ok: false, error: "Selected SaaS plan not found." };

  let couponRow: { id: string; code: string; discount_type: "percent" | "amount"; discount_value: number } | null = null;
  if (d.couponCode) {
    const { data: c } = await auth.admin
      .from("saas_coupons")
      .select("*")
      .eq("code", d.couponCode.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    if (!c) return { ok: false, error: "Invalid or inactive coupon code." };
    if (c.expires_at && new Date(c.expires_at) < new Date()) {
      return { ok: false, error: "Coupon has expired." };
    }
    couponRow = {
      id: c.id,
      code: c.code,
      discount_type: c.discount_type === "amount" ? "amount" : "percent",
      discount_value: Number(c.discount_value),
    };
  }

  const calc = calculateSaaSPrice({
    slabs: parseSlabs(plan.slabs),
    studentCount: d.studentCountTier,
    billingCycle: d.billingCycle,
    yearlyDiscountPct: Number(plan.yearly_discount_pct),
    setupFeeInr: Number(plan.setup_fee_inr),
    includeSetupFee: d.includeSetupFee && !d.startAsTrial,
    gstPct: Number(plan.gst_pct ?? platformCfg?.default_gst_pct ?? 18),
    coupon: couponRow
      ? {
          code: couponRow.code,
          discountType: couponRow.discount_type,
          discountValue: couponRow.discount_value,
        }
      : null,
  });

  const trialDays = platformCfg?.default_trial_days ?? 14;
  const now = new Date();
  const trialEndsAt = d.startAsTrial
    ? new Date(now.getTime() + trialDays * 86_400_000).toISOString()
    : null;
  const periodEnd = new Date(
    now.getTime() + (d.startAsTrial ? trialDays : d.billingCycle === "yearly" ? 365 : 30) * 86_400_000,
  ).toISOString();

  const lifecycle: SchoolLifecycleStatus = d.startAsTrial ? "trial" : "active";
  const loginId = `${schoolCode}-ADM-01`;
  const tempPassword = `Edu#${crypto.randomBytes(6).toString("base64url")}9`;
  const initials =
    d.adminName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") || "SA";

  // 1. Create auth user first (easiest atomic check before DB writes or cleanly deleted on DB failure)
  const createdAuth = await auth.admin.auth.admin.createUser({
    email: d.adminEmail.toLowerCase(),
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: d.adminName },
  });
  if (createdAuth.error || !createdAuth.data.user) {
    return {
      ok: false,
      error: getErrorMessage(createdAuth.error, "Unable to create School Admin Auth user (email may already exist)."),
    };
  }
  const adminUserId = createdAuth.data.user.id;
  let createdSchoolId: string | null = null;

  try {
    // 2. Insert school
    const { data: schoolRow, error: schoolErr } = await auth.admin
      .from("schools")
      .insert({
        school_code: schoolCode,
        name: d.name,
        board: d.board,
        address: d.address,
        contact_email: d.contactEmail,
        contact_phone: d.contactPhone,
        accent_color: d.accentColor,
        timezone: d.timezone,
        status: lifecycle,
        is_demo: false,
        enabled_modules: plan.enabled_modules,
      })
      .select("*")
      .single();
    if (schoolErr || !schoolRow) throw schoolErr ?? new Error("School creation failed");
    createdSchoolId = schoolRow.id;

    // 3. Update auth app_metadata with school_id + role
    await auth.admin.auth.admin.updateUserById(adminUserId, {
      app_metadata: {
        role: "school_admin",
        school_id: createdSchoolId,
        user_code: loginId,
        full_name: d.adminName,
        subtitle: "School Administrator",
      },
    });

    // 4. Upsert admin profile scoped to new school
    const { error: profErr } = await auth.admin.from("profiles").upsert(
      {
        id: adminUserId,
        school_id: createdSchoolId,
        user_code: loginId,
        email: d.adminEmail.toLowerCase(),
        full_name: d.adminName,
        role: "school_admin",
        initials,
        subtitle: "School Administrator",
        phone: d.adminPhone ?? null,
        status: "Active",
        must_change_password: true,
      },
      { onConflict: "id" },
    );
    if (profErr) throw profErr;

    // 5. School settings + Academic Year + Default Classes + Subjects + Roles
    const sections = d.sectionsCsv
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    const validSections = sections.length > 0 ? sections : ["A", "B"];
    const grades = generateClassListFromPreset(d.gradePreset, d.customGrades);

    const [settingsRes, ayRes, classesRes, subjRes, roleRes] = await Promise.all([
      auth.admin.from("school_settings").insert({
        school_id: createdSchoolId,
        singleton_key: `${schoolCode}-default`,
        school_name: d.name,
        affiliation_code: `${d.board}-${schoolCode}`,
        principal_name: d.adminName,
        official_email: d.contactEmail,
        phone: d.contactPhone,
        timezone_currency: `${d.timezone} · INR (₹)`,
        address: d.address || "Campus Address Pending",
        grading_mode: "CBSE CGPA + Percentage",
      }),
      auth.admin.from("academic_years").insert({
        school_id: createdSchoolId,
        code: `${schoolCode}-AY-${d.academicYearName.replace(/[^A-Za-z0-9]/g, "")}`,
        name: d.academicYearName,
        start_date: d.academicYearStart,
        end_date: d.academicYearEnd,
        start_label: d.academicYearStart,
        end_label: d.academicYearEnd,
        status: "Active",
      }),
      auth.admin.from("school_classes").insert(
        grades.map((g) => ({
          school_id: createdSchoolId!,
          code: `${schoolCode}-CLS-${g.name.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}`,
          name: g.name,
          grade_order: g.gradeOrder,
          wing: g.wing,
          sections: validSections,
          capacity: 40,
          room_block: "Main Block",
        })),
      ),
      auth.admin.from("subjects").insert([
        { school_id: createdSchoolId, code: `${schoolCode}-ENG`, name: "English", category: "Core" },
        { school_id: createdSchoolId, code: `${schoolCode}-MATH`, name: "Mathematics", category: "Core" },
        { school_id: createdSchoolId, code: `${schoolCode}-SCI`, name: "Science", category: "Core" },
        { school_id: createdSchoolId, code: `${schoolCode}-SST`, name: "Social Studies", category: "Core" },
      ]),
      auth.admin
        .from("rbac_roles")
        .insert([
          { school_id: createdSchoolId, name: `${schoolCode} - School Admin`, description: "Full school administrator", is_system: true },
          { school_id: createdSchoolId, name: `${schoolCode} - Accountant`, description: "Fees, concessions & receipts", is_system: true },
          { school_id: createdSchoolId, name: `${schoolCode} - Librarian`, description: "Library catalog & issues", is_system: true },
          { school_id: createdSchoolId, name: `${schoolCode} - Transport`, description: "Routes, vehicles & stops", is_system: true },
          { school_id: createdSchoolId, name: `${schoolCode} - Hostel Warden`, description: "Hostel rooms & allocations", is_system: true },
          { school_id: createdSchoolId, name: `${schoolCode} - Receptionist`, description: "Enquiries & directory", is_system: true },
        ])
        .select("id, name"),
    ]);

    if (settingsRes.error) throw settingsRes.error;
    if (ayRes.error) throw ayRes.error;
    if (classesRes.error) throw classesRes.error;
    if (subjRes.error) throw subjRes.error;
    if (roleRes.error) throw roleRes.error;

    if (roleRes.data && roleRes.data.length > 0) {
      const permsPayload = roleRes.data.flatMap((r) => {
        const isAcc = r.name.includes("Accountant");
        const isLib = r.name.includes("Librarian");
        const isTr = r.name.includes("Transport");
        const isHo = r.name.includes("Hostel");
        const isRec = r.name.includes("Receptionist");
        const isFull = r.name.includes("School Admin");
        return [
          { school_id: createdSchoolId!, role_id: r.id, module: "Fees", can_view: isFull || isAcc, can_create: isFull || isAcc, can_edit: isFull || isAcc, can_delete: isFull, can_export: isFull || isAcc },
          { school_id: createdSchoolId!, role_id: r.id, module: "Library", can_view: isFull || isLib, can_create: isFull || isLib, can_edit: isFull || isLib, can_delete: isFull, can_export: isFull || isLib },
          { school_id: createdSchoolId!, role_id: r.id, module: "Transport", can_view: isFull || isTr, can_create: isFull || isTr, can_edit: isFull || isTr, can_delete: isFull, can_export: isFull || isTr },
          { school_id: createdSchoolId!, role_id: r.id, module: "Hostel", can_view: isFull || isHo, can_create: isFull || isHo, can_edit: isFull || isHo, can_delete: isFull, can_export: isFull || isHo },
          { school_id: createdSchoolId!, role_id: r.id, module: "Students", can_view: isFull || isRec, can_create: isFull || isRec, can_edit: isFull || isRec, can_delete: isFull, can_export: isFull },
        ];
      });
      await auth.admin.from("rbac_permissions").insert(permsPayload);
    }

    // 6. Subscription & Gapless FY Invoice (unless trial)
    const { data: subRow, error: subErr } = await auth.admin
      .from("school_subscriptions")
      .insert({
        school_id: createdSchoolId,
        plan_id: plan.id,
        billing_cycle: d.billingCycle,
        student_count_tier: d.studentCountTier,
        status: lifecycle,
        trial_ends_at: trialEndsAt,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd,
        coupon_id: couponRow?.id ?? null,
        monthly_rate_inr: d.startAsTrial ? 0 : calc.monthlyEquivalentMrrInr,
      })
      .select("id")
      .single();
    if (subErr || !subRow) throw subErr ?? new Error("Subscription insert failed");

    let invoiceNumber: string | null = null;
    if (!d.startAsTrial) {
      const fy = getIndianFinancialYear(now);
      const { data: invNo, error: seqErr } = await auth.admin.rpc("next_saas_invoice_number", { p_fy: fy });
      if (seqErr || !invNo) throw seqErr ?? new Error("Invoice number generation failed");
      invoiceNumber = invNo;

      const { error: invErr } = await auth.admin.from("saas_invoices").insert({
        invoice_number: invoiceNumber,
        financial_year: fy,
        school_id: createdSchoolId,
        subscription_id: subRow.id,
        subtotal_inr: calc.subtotalBeforeCouponInr,
        discount_inr: calc.couponDiscountInr,
        gst_pct: calc.gstPct,
        gst_amount_inr: calc.gstAmountInr,
        total_inr: calc.totalPayableInr,
        amount_paid_inr: 0,
        status: "issued",
        line_items: [
          {
            label: `${plan.name} (${d.billingCycle}, ${d.studentCountTier} students @ ₹${calc.perStudentMonthlyInr}/mo)`,
            amountInr: calc.baseSubscriptionInr,
          },
          ...(calc.setupFeeInr > 0
            ? [{ label: "One-time Onboarding & Setup Fee", amountInr: calc.setupFeeInr }]
            : []),
        ],
        notes: `Initial onboarding invoice for ${d.name} (${schoolCode})`,
      });
      if (invErr) throw invErr;
    }

    await auth.admin.from("saas_notification_log").insert({
      school_id: createdSchoolId,
      event_type: "handover",
      recipient_email: d.adminEmail.toLowerCase(),
      status: "queued",
      payload: { schoolCode, loginId, planName: plan.name },
    });

    revalidatePath("/platform");
    revalidatePath("/platform/schools");
    revalidatePath("/platform/invoices");

    return {
      ok: true,
      data: {
        schoolId: createdSchoolId,
        schoolCode,
        schoolName: d.name,
        board: d.board,
        adminName: d.adminName,
        adminEmail: d.adminEmail.toLowerCase(),
        loginId,
        tempPassword,
        planName: plan.name,
        billingCycle: d.billingCycle,
        totalPayableInr: d.startAsTrial ? 0 : calc.totalPayableInr,
        invoiceNumber,
        trialEndsAt,
        loginUrl: `/login?school=${encodeURIComponent(schoolCode)}`,
        micrositeUrl: `/s/${schoolCode}`,
      },
    };
  } catch (err) {
    // Clean up orphaned auth user and partial school row on provisioning failure
    await auth.admin.auth.admin.deleteUser(adminUserId).catch(() => null);
    if (createdSchoolId) {
      await auth.admin
        .from("schools")
        .update({ deleted_at: new Date().toISOString(), status: "cancelled" })
        .eq("id", createdSchoolId);
    }
    return { ok: false, error: getErrorMessage(err, "Atomic school provisioning failed.") };
  }
}

// ---------- Screen 114: School Detail, Modules, Proration, Users & Reset ----------

export async function getSchoolDetailAction(schoolId: string) {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false as const, error: auth.error ?? "Unauthorized" };

  const [schoolRes, subRes, usageRes, usersRes, invRes, holidayRes, auditRes, supportRes] =
    await Promise.all([
      auth.admin.from("schools").select("*").eq("id", schoolId).maybeSingle(),
      auth.admin
        .from("school_subscriptions")
        .select("*, saas_plans(*)")
        .eq("school_id", schoolId)
        .maybeSingle(),
      auth.admin.rpc("get_school_usage_summary", { p_school_id: schoolId }),
      auth.admin
        .from("profiles")
        .select("id, user_code, full_name, email, role, sub_role, status, last_login_at, must_change_password")
        .eq("school_id", schoolId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .limit(100),
      auth.admin
        .from("saas_invoices")
        .select("*")
        .eq("school_id", schoolId)
        .order("issued_at", { ascending: false }),
      auth.admin
        .from("school_holidays")
        .select("*")
        .eq("school_id", schoolId)
        .order("holiday_date", { ascending: true }),
      auth.admin
        .from("audit_logs")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(30),
      auth.admin
        .from("support_sessions")
        .select("*")
        .eq("school_id", schoolId)
        .is("ended_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle(),
    ]);

  if (!schoolRes.data) {
    return { ok: false as const, error: "School record not found." };
  }

  const u = usageRes.data?.[0];
  const studentsCount = Number(u?.students_count ?? 0);
  const teachersCount = Number(u?.teachers_count ?? 0);
  const maxStudents = Number(u?.max_students ?? 500);
  const maxTeachers = Number(u?.max_teachers ?? 60);
  const storageMb = Math.round((Number(u?.storage_bytes ?? 0) / (1024 * 1024)) * 100) / 100;
  const maxStorageMb = Number(u?.max_storage_mb ?? 5120);

  const usage: SchoolUsageDto = {
    studentsCount,
    teachersCount,
    staffCount: Number(u?.staff_count ?? 0),
    usersCount: Number(u?.users_count ?? 0),
    storageMb,
    maxStudents,
    maxTeachers,
    maxStaff: Number(u?.max_staff ?? 30),
    maxStorageMb,
    warn80:
      studentsCount >= maxStudents * 0.8 ||
      teachersCount >= maxTeachers * 0.8 ||
      storageMb >= maxStorageMb * 0.8,
    blocked100:
      studentsCount >= maxStudents || teachersCount >= maxTeachers || storageMb >= maxStorageMb,
  };

  return {
    ok: true as const,
    data: {
      school: schoolRes.data,
      subscription: subRes.data,
      usage,
      users: usersRes.data ?? [],
      invoices: invRes.data ?? [],
      holidays: holidayRes.data ?? [],
      auditLogs: auditRes.data ?? [],
      activeSupportSession: supportRes.data ?? null,
    },
  };
}

export async function updateSchoolModulesAction(params: {
  schoolId: string;
  enabledModules: string[];
}): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const valid = params.enabledModules.filter((m) =>
    (ALL_SCHOOL_MODULES as readonly string[]).includes(m),
  );
  if (!valid.includes("setup")) valid.unshift("setup");

  const { error } = await auth.admin
    .from("schools")
    .update({ enabled_modules: valid })
    .eq("id", params.schoolId);

  if (error) return { ok: false, error: getErrorMessage(error, "Failed saving modules.") };
  revalidatePath(`/platform/schools/${params.schoolId}`);
  return { ok: true };
}

export async function changeSchoolPlanAction(params: {
  schoolId: string;
  newPlanId: string;
  billingCycle: "monthly" | "yearly";
  studentCountTier: number;
}): Promise<ActionResult<{ invoiceNumber: string | null; creditNoteNumber: string | null }>> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const [{ data: existingSub }, { data: newPlan }] = await Promise.all([
    auth.admin.from("school_subscriptions").select("*").eq("school_id", params.schoolId).single(),
    auth.admin.from("saas_plans").select("*").eq("id", params.newPlanId).single(),
  ]);
  if (!existingSub || !newPlan) return { ok: false, error: "Subscription or target plan missing." };

  const calc = calculateSaaSPrice({
    slabs: parseSlabs(newPlan.slabs),
    studentCount: params.studentCountTier,
    billingCycle: params.billingCycle,
    yearlyDiscountPct: Number(newPlan.yearly_discount_pct),
    setupFeeInr: 0,
    includeSetupFee: false,
    gstPct: Number(newPlan.gst_pct ?? 18),
  });

  const remainingMs = Math.max(0, new Date(existingSub.current_period_end).getTime() - Date.now());
  const remainingDays = Math.max(1, Math.ceil(remainingMs / 86_400_000));
  const totalCycleDays = existingSub.billing_cycle === "yearly" ? 365 : 30;
  const proration = calculateProration({
    oldMonthlyRateInr: Number(existingSub.monthly_rate_inr ?? 0),
    newMonthlyRateInr: calc.monthlyEquivalentMrrInr,
    remainingDays,
    totalCycleDays,
  });

  const { error: updErr } = await auth.admin
    .from("school_subscriptions")
    .update({
      plan_id: newPlan.id,
      billing_cycle: params.billingCycle,
      student_count_tier: params.studentCountTier,
      monthly_rate_inr: calc.monthlyEquivalentMrrInr,
      status: "active",
    })
    .eq("id", existingSub.id);
  if (updErr) return { ok: false, error: getErrorMessage(updErr, "Failed updating plan.") };

  await auth.admin
    .from("schools")
    .update({ enabled_modules: newPlan.enabled_modules, status: "active" })
    .eq("id", params.schoolId);

  const fy = getIndianFinancialYear();
  let invoiceNumber: string | null = null;
  let creditNoteNumber: string | null = null;

  if (proration.isUpgrade && proration.deltaInr > 0) {
    const { data: invNo } = await auth.admin.rpc("next_saas_invoice_number", { p_fy: fy });
    if (invNo) {
      invoiceNumber = invNo;
      const gstAmt = Math.round(proration.deltaInr * (Number(newPlan.gst_pct) / 100) * 100) / 100;
      await auth.admin.from("saas_invoices").insert({
        invoice_number: invNo,
        financial_year: fy,
        school_id: params.schoolId,
        subscription_id: existingSub.id,
        subtotal_inr: proration.deltaInr,
        discount_inr: 0,
        gst_pct: Number(newPlan.gst_pct),
        gst_amount_inr: gstAmt,
        total_inr: proration.deltaInr + gstAmt,
        amount_paid_inr: 0,
        status: "issued",
        line_items: [
          {
            label: `Mid-cycle Prorated Upgrade -> ${newPlan.name} (${remainingDays}d remaining)`,
            amountInr: proration.deltaInr,
          },
        ],
        notes: "Prorated mid-cycle plan upgrade",
      });
    }
  } else if (proration.creditNoteAmountInr > 0) {
    const { data: latestInv } = await auth.admin
      .from("saas_invoices")
      .select("id")
      .eq("school_id", params.schoolId)
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestInv) {
      const { data: cnNo } = await auth.admin.rpc("next_saas_credit_note_number", { p_fy: fy });
      if (cnNo) {
        creditNoteNumber = cnNo;
        await auth.admin.from("saas_credit_notes").insert({
          credit_note_number: cnNo,
          financial_year: fy,
          invoice_id: latestInv.id,
          school_id: params.schoolId,
          amount_inr: proration.creditNoteAmountInr,
          reason: `Mid-cycle plan downgrade proration -> ${newPlan.name}`,
        });
      }
    }
  }

  revalidatePath(`/platform/schools/${params.schoolId}`);
  revalidatePath("/platform/subscriptions");
  revalidatePath("/platform/invoices");
  return { ok: true, data: { invoiceNumber, creditNoteNumber } };
}

export async function resetSchoolUserPasswordAction(params: {
  userId: string;
}): Promise<ActionResult<{ loginId: string; email: string; tempPassword: string }>> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { data: prof } = await auth.admin
    .from("profiles")
    .select("id, role, user_code, email, school_id")
    .eq("id", params.userId)
    .single();
  if (!prof) return { ok: false, error: "User profile not found." };
  if (prof.role === "super_admin") {
    return { ok: false, error: "Use CLI seed:superadmin to rotate Super Admin password." };
  }

  const tempPassword = `Edu#${crypto.randomBytes(6).toString("base64url")}9`;
  const { error: updErr } = await auth.admin.auth.admin.updateUserById(prof.id, {
    password: tempPassword,
  });
  if (updErr) return { ok: false, error: getErrorMessage(updErr, "Password reset failed.") };

  await auth.admin
    .from("profiles")
    .update({ must_change_password: true })
    .eq("id", prof.id);

  revalidatePath(`/platform/schools/${prof.school_id}`);
  return {
    ok: true,
    data: {
      loginId: prof.user_code ?? prof.email,
      email: prof.email,
      tempPassword,
    },
  };
}

export async function toggleSchoolUserLockAction(params: {
  userId: string;
  nextStatus: "Active" | "Suspended";
}): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { data: prof } = await auth.admin
    .from("profiles")
    .select("id, role, school_id")
    .eq("id", params.userId)
    .single();
  if (!prof || prof.role === "super_admin") {
    return { ok: false, error: "Target account cannot be locked here." };
  }

  const { error } = await auth.admin
    .from("profiles")
    .update({ status: params.nextStatus })
    .eq("id", params.userId);
  if (error) return { ok: false, error: getErrorMessage(error, "Unable to change user lock.") };

  revalidatePath(`/platform/schools/${prof.school_id}`);
  return { ok: true };
}

// ---------- Screen 115: Plans & Coupons ----------

export async function listPlansAndCouponsAction() {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false as const, error: auth.error ?? "Unauthorized" };

  const [plansRes, couponsRes] = await Promise.all([
    auth.admin.from("saas_plans").select("*").order("setup_fee_inr", { ascending: true }),
    auth.admin.from("saas_coupons").select("*").order("created_at", { ascending: false }),
  ]);

  if (plansRes.error) return { ok: false as const, error: getErrorMessage(plansRes.error) };

  const plans: SaasPlanDto[] = (plansRes.data ?? []).map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    yearlyDiscountPct: Number(p.yearly_discount_pct),
    setupFeeInr: Number(p.setup_fee_inr),
    gstPct: Number(p.gst_pct),
    maxStudents: p.max_students,
    maxTeachers: p.max_teachers,
    maxStaff: p.max_staff,
    maxStorageMb: p.max_storage_mb,
    enabledModules: p.enabled_modules,
    slabs: parseSlabs(p.slabs),
    isActive: p.is_active,
  }));

  return { ok: true as const, data: { plans, coupons: couponsRes.data ?? [] } };
}

const planSaveSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(2).max(20),
  name: z.string().trim().min(2),
  description: z.string().trim().default(""),
  yearlyDiscountPct: z.number().min(0).max(80),
  setupFeeInr: z.number().min(0),
  gstPct: z.number().min(0).max(50),
  maxStudents: z.number().int().min(10),
  maxTeachers: z.number().int().min(1),
  maxStaff: z.number().int().min(1),
  maxStorageMb: z.number().int().min(100),
  enabledModules: z.array(z.string()).min(1),
  slabs: z
    .array(
      z.object({
        min: z.number().int().min(1),
        max: z.number().int().nullable(),
        price_per_student_month: z.number().min(1),
      }),
    )
    .min(1),
});

export async function upsertSaasPlanAction(
  raw: z.input<typeof planSaveSchema>,
): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const parsed = planSaveSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid plan." };

  const d = parsed.data;
  const payload = {
    code: d.code.toUpperCase(),
    name: d.name,
    description: d.description,
    yearly_discount_pct: d.yearlyDiscountPct,
    setup_fee_inr: d.setupFeeInr,
    gst_pct: d.gstPct,
    max_students: d.maxStudents,
    max_teachers: d.maxTeachers,
    max_staff: d.maxStaff,
    max_storage_mb: d.maxStorageMb,
    enabled_modules: d.enabledModules,
    slabs: d.slabs as unknown as Json,
  };

  const { error } = d.id
    ? await auth.admin.from("saas_plans").update(payload).eq("id", d.id)
    : await auth.admin.from("saas_plans").insert(payload);

  if (error) return { ok: false, error: getErrorMessage(error, "Unable to save SaaS plan.") };
  revalidatePath("/platform/plans");
  return { ok: true };
}

export async function upsertCouponAction(params: {
  code: string;
  discountType: "percent" | "amount";
  discountValue: number;
  expiresAt?: string;
}): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { error } = await auth.admin.from("saas_coupons").upsert(
    {
      code: params.code.trim().toUpperCase(),
      discount_type: params.discountType,
      discount_value: params.discountValue,
      expires_at: params.expiresAt ? new Date(params.expiresAt).toISOString() : null,
      is_active: true,
    },
    { onConflict: "code" },
  );
  if (error) return { ok: false, error: getErrorMessage(error, "Unable to save coupon.") };
  revalidatePath("/platform/plans");
  return { ok: true };
}

// ---------- Screens 116-117: Subscriptions, GST Invoices & Manual Payments ----------

export async function listSubscriptionsAndInvoicesAction() {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false as const, error: auth.error ?? "Unauthorized" };

  const [subsRes, invRes, payRes, cnRes] = await Promise.all([
    auth.admin
      .from("school_subscriptions")
      .select("*, schools(id, school_code, name, is_demo, status), saas_plans(id, name, code)")
      .order("created_at", { ascending: false }),
    auth.admin
      .from("saas_invoices")
      .select("*, schools(school_code, name)")
      .order("issued_at", { ascending: false })
      .limit(100),
    auth.admin
      .from("saas_payments")
      .select("*, schools(school_code, name), saas_invoices(invoice_number)")
      .order("paid_at", { ascending: false })
      .limit(100),
    auth.admin
      .from("saas_credit_notes")
      .select("*, schools(school_code, name)")
      .order("issued_at", { ascending: false })
      .limit(50),
  ]);

  return {
    ok: true as const,
    data: {
      subscriptions: subsRes.data ?? [],
      invoices: invRes.data ?? [],
      payments: payRes.data ?? [],
      creditNotes: cnRes.data ?? [],
    },
  };
}

export async function getInvoicePrintDataAction(invoiceId: string) {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false as const, error: auth.error ?? "Unauthorized" };

  const [invRes, cfgRes, payRes] = await Promise.all([
    auth.admin
      .from("saas_invoices")
      .select("*, schools(*)")
      .eq("id", invoiceId)
      .maybeSingle(),
    auth.admin.from("platform_settings").select("*").eq("singleton_key", "default").single(),
    auth.admin.from("saas_payments").select("*").eq("invoice_id", invoiceId).order("paid_at", { ascending: false }),
  ]);

  if (!invRes.data) return { ok: false as const, error: "Invoice not found." };
  return {
    ok: true as const,
    data: {
      invoice: invRes.data,
      platform: cfgRes.data,
      payments: payRes.data ?? [],
    },
  };
}

export async function recordManualPaymentAction(params: {
  invoiceId: string;
  amountInr: number;
  method: "UPI" | "Bank Transfer" | "Cash" | "Cheque";
  referenceNo: string;
  notes?: string;
}): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error || !auth.user) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { data: inv } = await auth.admin
    .from("saas_invoices")
    .select("*")
    .eq("id", params.invoiceId)
    .single();
  if (!inv) return { ok: false, error: "Invoice not found." };
  if (params.amountInr <= 0 || !params.referenceNo.trim()) {
    return { ok: false, error: "Enter valid amount and payment reference." };
  }

  const { error: payErr } = await auth.admin.from("saas_payments").insert({
    invoice_id: inv.id,
    school_id: inv.school_id,
    amount_inr: params.amountInr,
    method: params.method,
    reference_no: params.referenceNo.trim(),
    recorded_by: auth.user.id,
    notes: params.notes ?? "",
  });
  if (payErr) return { ok: false, error: getErrorMessage(payErr, "Failed recording payment.") };

  const newPaid = Math.round((Number(inv.amount_paid_inr) + params.amountInr) * 100) / 100;
  const nextStatus = newPaid >= Number(inv.total_inr) ? "paid" : "partially_paid";

  await auth.admin
    .from("saas_invoices")
    .update({ amount_paid_inr: newPaid, status: nextStatus })
    .eq("id", inv.id);

  // Reactivate school automatically on full payment
  if (nextStatus === "paid") {
    await Promise.all([
      auth.admin.from("schools").update({ status: "active" }).eq("id", inv.school_id),
      auth.admin
        .from("school_subscriptions")
        .update({ status: "active" })
        .eq("school_id", inv.school_id),
    ]);
  }

  revalidatePath("/platform");
  revalidatePath("/platform/invoices");
  revalidatePath("/platform/subscriptions");
  return { ok: true };
}

export async function queueRenewalRemindersAction(): Promise<ActionResult<{ queued: number }>> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { data: subs } = await auth.admin
    .from("school_subscriptions")
    .select("school_id, current_period_end, schools!inner(contact_email, is_demo, deleted_at)")
    .is("schools.deleted_at", null);

  let queued = 0;
  const nowMs = Date.now();
  for (const s of subs ?? []) {
    const sch = Array.isArray(s.schools) ? s.schools[0] : s.schools;
    if (!sch || sch.is_demo) continue;
    const daysLeft = Math.ceil((new Date(s.current_period_end).getTime() - nowMs) / 86_400_000);
    const eventType =
      daysLeft <= 1
        ? "renewal_1d"
        : daysLeft <= 7
          ? "renewal_7d"
          : daysLeft <= 30
            ? "renewal_30d"
            : null;
    if (eventType) {
      await auth.admin.from("saas_notification_log").insert({
        school_id: s.school_id,
        event_type: eventType,
        recipient_email: sch.contact_email || "admin@school.local",
        status: "queued",
        payload: { daysLeft, periodEnd: s.current_period_end },
      });
      queued += 1;
    }
  }

  revalidatePath("/platform/subscriptions");
  return { ok: true, data: { queued } };
}

// ---------- Screens 119-123: Announcements, Tickets, Audit, Platform Settings, Demo Reset & Support Access ----------

export async function listPlatformOpsDataAction() {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false as const, error: auth.error ?? "Unauthorized" };

  const [annRes, tickRes, auditRes, cfgRes, demoRes] = await Promise.all([
    auth.admin.from("platform_announcements").select("*").order("published_at", { ascending: false }),
    auth.admin
      .from("support_tickets")
      .select("*, schools(school_code, name)")
      .order("created_at", { ascending: false })
      .limit(100),
    auth.admin
      .from("audit_logs")
      .select("*, schools(school_code, name)")
      .order("created_at", { ascending: false })
      .limit(100),
    auth.admin.from("platform_settings").select("*").eq("singleton_key", "default").single(),
    auth.admin.from("schools").select("*").eq("id", DEMO_SCHOOL_ID).single(),
  ]);

  return {
    ok: true as const,
    data: {
      announcements: annRes.data ?? [],
      tickets: tickRes.data ?? [],
      auditLogs: auditRes.data ?? [],
      settings: cfgRes.data,
      demoSchool: demoRes.data,
    },
  };
}

export async function createPlatformAnnouncementAction(params: {
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
}): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { error } = await auth.admin.from("platform_announcements").insert({
    title: params.title.trim(),
    body: params.body.trim(),
    severity: params.severity,
    is_active: true,
  });
  if (error) return { ok: false, error: getErrorMessage(error, "Unable to publish announcement.") };
  revalidatePath("/platform/announcements");
  return { ok: true };
}

export async function updateSupportTicketAction(params: {
  ticketId: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  resolutionNotes: string;
}): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { error } = await auth.admin
    .from("support_tickets")
    .update({ status: params.status, resolution_notes: params.resolutionNotes })
    .eq("id", params.ticketId);
  if (error) return { ok: false, error: getErrorMessage(error, "Unable to update ticket.") };
  revalidatePath("/platform/tickets");
  return { ok: true };
}

export async function savePlatformSettingsAction(params: {
  platformName: string;
  ownerName: string;
  supportEmail: string;
  companyName: string;
  companyAddress: string;
  gstin: string;
  defaultTrialDays: number;
  defaultGraceDays: number;
  defaultGstPct: number;
}): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { error } = await auth.admin
    .from("platform_settings")
    .update({
      platform_name: params.platformName,
      owner_name: params.ownerName,
      support_email: params.supportEmail,
      company_name: params.companyName,
      company_address: params.companyAddress,
      gstin: params.gstin,
      default_trial_days: params.defaultTrialDays,
      default_grace_days: params.defaultGraceDays,
      default_gst_pct: params.defaultGstPct,
    })
    .eq("singleton_key", "default");
  if (error) return { ok: false, error: getErrorMessage(error, "Unable to update platform settings.") };
  revalidatePath("/platform/settings");
  return { ok: true };
}

export async function resetDemoSchoolAction(): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error) return { ok: false, error: auth.error ?? "Unauthorized" };

  await Promise.all([
    auth.admin
      .from("schools")
      .update({
        name: "Greenwood International Academy (Demo)",
        status: "active",
        is_demo: true,
        enabled_modules: [...ALL_SCHOOL_MODULES],
      })
      .eq("id", DEMO_SCHOOL_ID),
    auth.admin
      .from("school_settings")
      .update({
        school_name: "Greenwood International Academy",
        affiliation_code: "CBSE-1930824",
      })
      .eq("school_id", DEMO_SCHOOL_ID),
  ]);

  revalidatePath("/platform/settings");
  revalidatePath("/platform/schools");
  return { ok: true };
}

export async function startSupportSessionAction(params: {
  schoolId: string;
  reason: string;
  readOnly?: boolean;
}): Promise<ActionResult<{ sessionId: string; redirectTo: string }>> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error || !auth.user) return { ok: false, error: auth.error ?? "Unauthorized" };

  if (!params.reason.trim() || params.reason.trim().length < 5) {
    return { ok: false, error: "Provide an audit reason (min 5 characters) to start support access." };
  }

  // Close any previous open session by this super admin
  await auth.admin
    .from("support_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("super_admin_id", auth.user.id)
    .is("ended_at", null);

  const expiresAt = new Date(Date.now() + 60 * 60_000).toISOString();
  const { data: sessionRow, error } = await auth.admin
    .from("support_sessions")
    .insert({
      super_admin_id: auth.user.id,
      school_id: params.schoolId,
      reason: params.reason.trim(),
      read_only: params.readOnly ?? true,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error || !sessionRow) {
    return { ok: false, error: getErrorMessage(error, "Unable to initiate audited support session.") };
  }

  await auth.admin.from("audit_logs").insert({
    school_id: params.schoolId,
    actor_id: auth.user.id,
    actor_label: `${auth.profile?.full_name ?? "Super Admin"} (support_access)`,
    module: "platform_support",
    action: "SUPPORT_ACCESS_START",
    table_name: "support_sessions",
    record_id: sessionRow.id,
    new_data: { reason: params.reason.trim(), readOnly: params.readOnly ?? true, expiresAt },
  });

  revalidatePath("/platform");
  revalidatePath("/admin");
  return { ok: true, data: { sessionId: sessionRow.id, redirectTo: "/admin" } };
}

export async function endSupportSessionAction(): Promise<ActionResult> {
  const auth = await requireSuperAdmin();
  if (!auth.admin || auth.error || !auth.user) return { ok: false, error: auth.error ?? "Unauthorized" };

  const { data: active } = await auth.admin
    .from("support_sessions")
    .select("id, school_id")
    .eq("super_admin_id", auth.user.id)
    .is("ended_at", null);

  if (active && active.length > 0) {
    await auth.admin
      .from("support_sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("super_admin_id", auth.user.id)
      .is("ended_at", null);

    await auth.admin.from("audit_logs").insert({
      school_id: active[0].school_id,
      actor_id: auth.user.id,
      actor_label: `${auth.profile?.full_name ?? "Super Admin"} (support_access)`,
      module: "platform_support",
      action: "SUPPORT_ACCESS_END",
      table_name: "support_sessions",
      record_id: active[0].id,
    });
  }

  revalidatePath("/platform");
  revalidatePath("/admin");
  return { ok: true };
}

export async function getActiveSupportSessionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: prof } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (prof?.role !== "super_admin") return null;

  const { data: session } = await admin
    .from("support_sessions")
    .select("id, school_id, reason, read_only, expires_at, schools(school_code, name)")
    .eq("super_admin_id", user.id)
    .is("ended_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) return null;
  const sch = Array.isArray(session.schools) ? session.schools[0] : session.schools;
  return {
    id: session.id,
    schoolId: session.school_id,
    schoolCode: sch?.school_code ?? "SCHOOL",
    schoolName: sch?.name ?? "Target School",
    reason: session.reason,
    readOnly: session.read_only,
    expiresAt: session.expires_at,
  };
}
