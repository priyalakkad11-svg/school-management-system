import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/db";
import type { UserRole } from "../src/types/domain";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const ROLE_EMAILS: Record<UserRole, string> = {
  admin: "priya.lakkad@greenwood.edu",
  teacher: "kavita.nair@greenwood.edu",
  student: "aarav.sharma@student.greenwood.edu",
  parent: "rajesh.sharma@gmail.com",
  staff: "mohan.joshi@greenwood.edu",
};

interface AssertionResult {
  name: string;
  passed: boolean;
  detail?: string;
}

const results: AssertionResult[] = [];

function record(name: string, passed: boolean, detail?: string) {
  results.push({ name, passed, detail });
  if (!passed) {
    console.error(`FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function signInAs(
  url: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<{ client: SupabaseClient<Database>; userId: string }> {
  const client = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new Error(`Unable to sign in test account ${email}: ${error?.message ?? "unknown"}`);
  }
  return { client, userId: data.user.id };
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const password = process.env.SEED_DEFAULT_PASSWORD?.trim();

  if (!url || !anonKey || !password) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SEED_DEFAULT_PASSWORD must be set in .env.local",
    );
  }

  const anonClient = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const sessions = {
    admin: await signInAs(url, anonKey, ROLE_EMAILS.admin, password),
    teacher: await signInAs(url, anonKey, ROLE_EMAILS.teacher, password),
    student: await signInAs(url, anonKey, ROLE_EMAILS.student, password),
    parent: await signInAs(url, anonKey, ROLE_EMAILS.parent, password),
    staff: await signInAs(url, anonKey, ROLE_EMAILS.staff, password),
  };

  // --- Module 1: profiles & audit_logs ---
  {
    const { data: anonProfiles } = await anonClient.from("profiles").select("id");
    record(
      "[profiles] anon denied SELECT",
      (anonProfiles?.length ?? 0) === 0,
      `got ${anonProfiles?.length ?? 0} rows`,
    );

    const { error: anonInsertErr } = await anonClient.from("profiles").insert({
      id: "00000000-0000-0000-0000-000000000000",
      email: "bad@example.com",
      full_name: "Bad",
    });
    record("[profiles] anon denied INSERT", Boolean(anonInsertErr));

    const { data: adminProfiles } = await sessions.admin.client.from("profiles").select("id");
    record(
      "[profiles] admin reads all seeded profiles",
      (adminProfiles?.length ?? 0) >= 5,
      `got ${adminProfiles?.length ?? 0} rows`,
    );

    for (const role of ["teacher", "student", "parent", "staff"] as const) {
      const { client, userId } = sessions[role];
      const { data: visible } = await client.from("profiles").select("id");
      record(
        `[profiles] ${role} reads ONLY own profile`,
        visible?.length === 1 && visible[0]?.id === userId,
        `got ${visible?.length ?? 0} rows`,
      );

      const { error: escalateErr } = await client
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userId);
      record(`[profiles] ${role} denied self role escalation`, Boolean(escalateErr));
    }

    const { data: adminAudits, error: adminAuditErr } = await sessions.admin.client
      .from("audit_logs")
      .select("id")
      .limit(5);
    record("[audit_logs] admin allowed SELECT", !adminAuditErr && Array.isArray(adminAudits));

    for (const role of ["teacher", "student", "parent", "staff"] as const) {
      const { data: deniedAudits } = await sessions[role].client
        .from("audit_logs")
        .select("id")
        .limit(5);
      record(
        `[audit_logs] ${role} denied SELECT`,
        (deniedAudits?.length ?? 0) === 0,
        `got ${deniedAudits?.length ?? 0} rows`,
      );
    }

    const { data: anonAudits } = await anonClient.from("audit_logs").select("id");
    record("[audit_logs] anon denied SELECT", (anonAudits?.length ?? 0) === 0);
  }

  // --- Module 2: school_settings, academic_years, school_classes, subjects, csm, rbac ---
  {
    const { data: anonSettings } = await anonClient.from("school_settings").select("id");
    record("[school_settings] anon denied SELECT", (anonSettings?.length ?? 0) === 0);

    const { data: adminSettings } = await sessions.admin.client.from("school_settings").select("id");
    record("[school_settings] admin reads row", (adminSettings?.length ?? 0) >= 1);

    const { data: teacherClasses } = await sessions.teacher.client.from("school_classes").select("id");
    record("[school_classes] authenticated teacher reads active classes", (teacherClasses?.length ?? 0) >= 1);

    for (const role of ["teacher", "student", "parent", "staff"] as const) {
      const { error: ayInsertErr } = await sessions[role].client.from("academic_years").insert({
        code: `TEST-${role}`,
        name: "Unauthorized Session",
        start_date: "2028-04-01",
        end_date: "2029-03-31",
        start_label: "01 Apr 2028",
        end_label: "31 Mar 2029",
      });
      record(`[academic_years] ${role} denied INSERT`, Boolean(ayInsertErr));

      const { error: clsInsertErr } = await sessions[role].client.from("school_classes").insert({
        code: `TEST-${role}`,
        name: "Unauthorized Class",
        grade_order: 1,
        wing: "Test",
      });
      record(`[school_classes] ${role} denied INSERT`, Boolean(clsInsertErr));
    }

    const { data: staffRbac } = await sessions.staff.client.from("rbac_roles").select("id");
    record("[rbac_roles] staff allowed SELECT", (staffRbac?.length ?? 0) >= 1);

    for (const role of ["teacher", "student", "parent"] as const) {
      const { data: deniedRbac } = await sessions[role].client.from("rbac_roles").select("id");
      record(`[rbac_roles] ${role} denied SELECT`, (deniedRbac?.length ?? 0) === 0);
    }

    const { error: staffPermEditErr } = await sessions.staff.client
      .from("rbac_roles")
      .insert({ name: "Escalated Role" });
    record("[rbac_roles] staff denied INSERT", Boolean(staffPermEditErr));
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`RLS Matrix Summary: ${passed} passed, ${failed} failed (total ${results.length})`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("RLS suite failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
