import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/db";

const SCHOOL_A_ID = "22222222-2222-4222-8222-222222222222";
const SCHOOL_B_ID = "33333333-3333-4333-8333-333333333333";
const SCHOOL_A_CODE = "TENANTA";
const SCHOOL_B_CODE = "TENANTB";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

interface CheckResult {
  name: string;
  passed: boolean;
  detail?: string;
}

const results: CheckResult[] = [];

function record(name: string, passed: boolean, detail?: string) {
  results.push({ name, passed, detail });
  const icon = passed ? "PASS" : "FAIL";
  console.log(`  [${icon}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function ensureTenantAdmin(
  admin: SupabaseClient<Database>,
  params: {
    email: string;
    password: string;
    schoolId: string;
    userCode: string;
    fullName: string;
  },
): Promise<string> {
  const { data: usersList, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) throw listErr;

  const existing = usersList.users.find(
    (u) => u.email?.toLowerCase() === params.email.toLowerCase(),
  );

  let userId: string;
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: params.password,
      email_confirm: true,
      app_metadata: {
        role: "school_admin",
        school_id: params.schoolId,
        user_code: params.userCode,
        full_name: params.fullName,
        subtitle: "School Administrator",
      },
    });
    if (error) throw error;
    userId = existing.id;
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: params.email,
      password: params.password,
      email_confirm: true,
      app_metadata: {
        role: "school_admin",
        school_id: params.schoolId,
        user_code: params.userCode,
        full_name: params.fullName,
        subtitle: "School Administrator",
      },
      user_metadata: { full_name: params.fullName },
    });
    if (error || !created.user) throw error ?? new Error(`Failed creating ${params.email}`);
    userId = created.user.id;
  }

  const { error: profErr } = await admin.from("profiles").upsert(
    {
      id: userId,
      school_id: params.schoolId,
      user_code: params.userCode,
      email: params.email,
      full_name: params.fullName,
      role: "school_admin",
      initials: "TA",
      subtitle: "School Administrator",
      status: "Active",
      must_change_password: false,
    },
    { onConflict: "id" },
  );
  if (profErr) throw profErr;

  return userId;
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    throw new Error("Missing Supabase credentials in .env.local");
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Introspect every table with school_id via get_tenant_rls_audit()
  console.log("\n=== Tenant RLS Schema Introspection ===");
  const { data: auditRows, error: auditErr } = await admin.rpc("get_tenant_rls_audit");
  if (auditErr || !auditRows) {
    throw new Error(`get_tenant_rls_audit failed: ${auditErr?.message ?? "no rows"}`);
  }

  record(
    "get_tenant_rls_audit returns >= 9 tenant tables",
    auditRows.length >= 9,
    `found ${auditRows.length} tables`,
  );

  for (const row of auditRows) {
    record(
      `[schema:${row.table_name}] RLS enabled + >=1 policy + school_id scoped`,
      row.rls_enabled === true && Number(row.policy_count) > 0 && row.has_school_scope === true,
      `rls=${row.rls_enabled}, policies=${row.policy_count}, scoped=${row.has_school_scope}`,
    );
  }

  // 2. Seed School A & School B + Admins + fixtures for every tenant table
  console.log("\n=== Seeding Isolated Tenant Fixtures (School A & School B) ===");
  const { error: schoolsErr } = await admin.from("schools").upsert(
    [
      {
        id: SCHOOL_A_ID,
        school_code: SCHOOL_A_CODE,
        name: "Alpha Academy (Tenant Test A)",
        board: "CBSE",
        status: "active",
        is_demo: false,
      },
      {
        id: SCHOOL_B_ID,
        school_code: SCHOOL_B_CODE,
        name: "Beta Public School (Tenant Test B)",
        board: "ICSE",
        status: "active",
        is_demo: false,
      },
    ],
    { onConflict: "id" },
  );
  if (schoolsErr) throw schoolsErr;

  const testPassword = `Tenant$${crypto.randomBytes(6).toString("hex")}9`;
  const userAId = await ensureTenantAdmin(admin, {
    email: "tenant.a.admin@test.educore.in",
    password: testPassword,
    schoolId: SCHOOL_A_ID,
    userCode: `${SCHOOL_A_CODE}-ADM-01`,
    fullName: "Alpha School Admin",
  });
  const userBId = await ensureTenantAdmin(admin, {
    email: "tenant.b.admin@test.educore.in",
    password: testPassword,
    schoolId: SCHOOL_B_ID,
    userCode: `${SCHOOL_B_CODE}-ADM-01`,
    fullName: "Beta School Admin",
  });

  // Ensure deterministic fixtures exist in School B (and School A where needed)
  const settingsBId = "33333333-0001-4333-8333-333333333333";
  const ayBId = "33333333-0002-4333-8333-333333333333";
  const clsBId = "33333333-0003-4333-8333-333333333333";
  const subjBId = "33333333-0004-4333-8333-333333333333";
  const csmBId = "33333333-0005-4333-8333-333333333333";
  const roleBId = "33333333-0006-4333-8333-333333333333";
  const permBId = "33333333-0007-4333-8333-333333333333";

  const fixtureSeedOps = await Promise.all([
    admin.from("school_settings").upsert(
      {
        id: settingsBId,
        school_id: SCHOOL_B_ID,
        singleton_key: `${SCHOOL_B_CODE}-default`,
        school_name: "Beta Public School",
        affiliation_code: "ICSE-B-999",
        principal_name: "Dr. B Principal",
        official_email: "office@beta.test.educore.in",
        phone: "+91 9000000002",
        timezone_currency: "Asia/Kolkata · INR (₹)",
        address: "Sector 12, Beta City",
        grading_mode: "Percentage + Grade",
      },
      { onConflict: "id" },
    ),
    admin.from("academic_years").upsert(
      {
        id: ayBId,
        school_id: SCHOOL_B_ID,
        code: `${SCHOOL_B_CODE}-AY-26-27`,
        name: "2026-27 Beta",
        start_date: "2026-04-01",
        end_date: "2027-03-31",
        start_label: "01 Apr 2026",
        end_label: "31 Mar 2027",
        status: "Active",
      },
      { onConflict: "id" },
    ),
    admin.from("school_classes").upsert(
      {
        id: clsBId,
        school_id: SCHOOL_B_ID,
        code: `${SCHOOL_B_CODE}-CLS-10`,
        name: "Grade 10 Beta",
        grade_order: 10,
        wing: "Senior",
        sections: ["A"],
        class_teachers: "Ms. Beta",
        capacity: 40,
        room_block: "B-101",
      },
      { onConflict: "id" },
    ),
    admin.from("subjects").upsert(
      {
        id: subjBId,
        school_id: SCHOOL_B_ID,
        code: `${SCHOOL_B_CODE}-MATH10`,
        name: "Mathematics Beta",
        category: "Core",
        max_theory: 80,
        max_practical: 20,
        periods_per_week: 6,
      },
      { onConflict: "id" },
    ),
    admin.from("rbac_roles").upsert(
      {
        id: roleBId,
        school_id: SCHOOL_B_ID,
        name: `${SCHOOL_B_CODE}-Accountant`,
        description: "Beta school finance role",
        is_system: false,
      },
      { onConflict: "id" },
    ),
  ]);
  for (const op of fixtureSeedOps) {
    if (op.error) throw op.error;
  }

  const csmRes = await admin.from("class_subject_mappings").upsert(
    {
      id: csmBId,
      school_id: SCHOOL_B_ID,
      academic_year_id: ayBId,
      class_id: clsBId,
      subject_id: subjBId,
      periods_per_week: 6,
      is_mandatory: true,
      mapped: true,
    },
    { onConflict: "id" },
  );
  if (csmRes.error) throw csmRes.error;

  const permRes = await admin.from("rbac_permissions").upsert(
    {
      id: permBId,
      school_id: SCHOOL_B_ID,
      role_id: roleBId,
      module: "Fees",
      can_view: true,
      can_create: true,
      can_edit: true,
      can_delete: false,
      can_export: true,
    },
    { onConflict: "id" },
  );
  if (permRes.error) throw permRes.error;

  // Storage fixtures in all 4 buckets under SCHOOL_B_ID/
  const pngBytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  const pdfBytes = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
  const bucketFixtures: Record<"avatars" | "documents" | "study-material" | "receipts", { ext: string; mime: string; data: Buffer }> = {
    avatars: { ext: "png", mime: "image/png", data: pngBytes },
    documents: { ext: "pdf", mime: "application/pdf", data: pdfBytes },
    "study-material": { ext: "pdf", mime: "application/pdf", data: pdfBytes },
    receipts: { ext: "pdf", mime: "application/pdf", data: pdfBytes },
  };
  for (const bucket of ["avatars", "documents", "study-material", "receipts"] as const) {
    const spec = bucketFixtures[bucket];
    const objectPath = `${SCHOOL_B_ID}/${userBId}/probe.${spec.ext}`;
    const { error: upErr } = await admin.storage
      .from(bucket)
      .upload(objectPath, spec.data, { contentType: spec.mime, upsert: true });
    if (upErr) throw upErr;
  }

  // Sign in User A as normal anon client (subject to RLS)
  const clientA = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInErr } = await clientA.auth.signInWithPassword({
    email: "tenant.a.admin@test.educore.in",
    password: testPassword,
  });
  if (signInErr) throw signInErr;

  const clientB = createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signInBErr } = await clientB.auth.signInWithPassword({
    email: "tenant.b.admin@test.educore.in",
    password: testPassword,
  });
  if (signInBErr) throw signInBErr;

  try {
    console.log("\n=== Cross-Tenant SELECT / INSERT / UPDATE / DELETE Matrix (User A -> School B) ===");

    // schools table
    const { data: schBRead } = await clientA.from("schools").select("id").eq("id", SCHOOL_B_ID);
    record("[schools] User A denied SELECT on School B", (schBRead?.length ?? 0) === 0);

    const { error: schInsertErr } = await clientA.from("schools").insert({
      school_code: "ROGUE01",
      name: "Rogue School",
    });
    record("[schools] User A denied INSERT", Boolean(schInsertErr));

    // profiles
    const { data: profBRead } = await clientA.from("profiles").select("id").eq("school_id", SCHOOL_B_ID);
    record("[profiles] User A denied SELECT School B", (profBRead?.length ?? 0) === 0);
    const { error: profInsertErr } = await clientA.from("profiles").insert({
      id: crypto.randomUUID(),
      school_id: SCHOOL_B_ID,
      email: "rogue@beta.in",
      full_name: "Rogue",
      role: "student",
    });
    record("[profiles] User A denied INSERT into School B", Boolean(profInsertErr));
    const { error: profEscalateErr } = await clientA
      .from("profiles")
      .update({ role: "super_admin" })
      .eq("id", userAId);
    record("[profiles] User A denied self-escalation to super_admin", Boolean(profEscalateErr));
    const { error: profCrossMoveErr } = await clientA
      .from("profiles")
      .update({ school_id: SCHOOL_B_ID })
      .eq("id", userAId);
    record("[profiles] User A denied moving own school_id to School B", Boolean(profCrossMoveErr));
    const { data: profUpdB } = await clientA
      .from("profiles")
      .update({ full_name: "Hacked Beta" })
      .eq("id", userBId)
      .select("id");
    record("[profiles] User A denied UPDATE School B user", (profUpdB?.length ?? 0) === 0);
    const { data: profDelB } = await clientA
      .from("profiles")
      .delete()
      .eq("id", userBId)
      .select("id");
    record("[profiles] User A denied DELETE School B user", (profDelB?.length ?? 0) === 0);

    // audit_logs
    const { data: auditBRead } = await clientA.from("audit_logs").select("id").eq("school_id", SCHOOL_B_ID);
    record("[audit_logs] User A denied SELECT School B", (auditBRead?.length ?? 0) === 0);

    // school_settings
    const { data: setBRead } = await clientA.from("school_settings").select("id").eq("id", settingsBId);
    record("[school_settings] User A denied SELECT School B", (setBRead?.length ?? 0) === 0);
    const { error: setBIns } = await clientA.from("school_settings").insert({
      school_id: SCHOOL_B_ID,
      singleton_key: `${SCHOOL_B_CODE}-rogue`,
      school_name: "Rogue",
      affiliation_code: "R1",
      principal_name: "R",
      official_email: "r@r.in",
      phone: "1",
      timezone_currency: "IST",
      address: "R",
      grading_mode: "CBSE",
    });
    record("[school_settings] User A denied INSERT into School B", Boolean(setBIns));
    const { data: setBUpd } = await clientA
      .from("school_settings")
      .update({ school_name: "Hacked" })
      .eq("id", settingsBId)
      .select("id");
    record("[school_settings] User A denied UPDATE School B", (setBUpd?.length ?? 0) === 0);
    const { data: setBDel } = await clientA
      .from("school_settings")
      .delete()
      .eq("id", settingsBId)
      .select("id");
    record("[school_settings] User A denied DELETE School B", (setBDel?.length ?? 0) === 0);

    // academic_years
    const { data: ayBRead } = await clientA.from("academic_years").select("id").eq("id", ayBId);
    record("[academic_years] User A denied SELECT School B", (ayBRead?.length ?? 0) === 0);
    const { error: ayBIns } = await clientA.from("academic_years").insert({
      school_id: SCHOOL_B_ID,
      code: `${SCHOOL_B_CODE}-ROGUE-AY`,
      name: "Rogue AY",
      start_date: "2028-04-01",
      end_date: "2029-03-31",
      start_label: "01 Apr 2028",
      end_label: "31 Mar 2029",
    });
    record("[academic_years] User A denied INSERT into School B", Boolean(ayBIns));
    const { data: ayBUpd } = await clientA
      .from("academic_years")
      .update({ name: "Hacked AY" })
      .eq("id", ayBId)
      .select("id");
    record("[academic_years] User A denied UPDATE School B", (ayBUpd?.length ?? 0) === 0);
    const { data: ayBDel } = await clientA
      .from("academic_years")
      .delete()
      .eq("id", ayBId)
      .select("id");
    record("[academic_years] User A denied DELETE School B", (ayBDel?.length ?? 0) === 0);

    // school_classes
    const { data: clsBRead } = await clientA.from("school_classes").select("id").eq("id", clsBId);
    record("[school_classes] User A denied SELECT School B", (clsBRead?.length ?? 0) === 0);
    const { error: clsBIns } = await clientA.from("school_classes").insert({
      school_id: SCHOOL_B_ID,
      code: `${SCHOOL_B_CODE}-ROGUE-CLS`,
      name: "Rogue Class",
      grade_order: 99,
      wing: "Test",
    });
    record("[school_classes] User A denied INSERT into School B", Boolean(clsBIns));
    const { data: clsBUpd } = await clientA
      .from("school_classes")
      .update({ name: "Hacked Class" })
      .eq("id", clsBId)
      .select("id");
    record("[school_classes] User A denied UPDATE School B", (clsBUpd?.length ?? 0) === 0);
    const { data: clsBDel } = await clientA
      .from("school_classes")
      .delete()
      .eq("id", clsBId)
      .select("id");
    record("[school_classes] User A denied DELETE School B", (clsBDel?.length ?? 0) === 0);

    // subjects
    const { data: subjBRead } = await clientA.from("subjects").select("id").eq("id", subjBId);
    record("[subjects] User A denied SELECT School B", (subjBRead?.length ?? 0) === 0);
    const { error: subjBIns } = await clientA.from("subjects").insert({
      school_id: SCHOOL_B_ID,
      code: `${SCHOOL_B_CODE}-ROGUE-SUBJ`,
      name: "Rogue Subject",
      category: "Core",
    });
    record("[subjects] User A denied INSERT into School B", Boolean(subjBIns));
    const { data: subjBUpd } = await clientA
      .from("subjects")
      .update({ name: "Hacked Subj" })
      .eq("id", subjBId)
      .select("id");
    record("[subjects] User A denied UPDATE School B", (subjBUpd?.length ?? 0) === 0);
    const { data: subjBDel } = await clientA
      .from("subjects")
      .delete()
      .eq("id", subjBId)
      .select("id");
    record("[subjects] User A denied DELETE School B", (subjBDel?.length ?? 0) === 0);

    // class_subject_mappings
    const { data: csmBRead } = await clientA.from("class_subject_mappings").select("id").eq("id", csmBId);
    record("[class_subject_mappings] User A denied SELECT School B", (csmBRead?.length ?? 0) === 0);
    const { error: csmBIns } = await clientA.from("class_subject_mappings").insert({
      school_id: SCHOOL_B_ID,
      academic_year_id: ayBId,
      class_id: clsBId,
      subject_id: subjBId,
      periods_per_week: 1,
    });
    record("[class_subject_mappings] User A denied INSERT into School B", Boolean(csmBIns));
    const { data: csmBUpd } = await clientA
      .from("class_subject_mappings")
      .update({ periods_per_week: 9 })
      .eq("id", csmBId)
      .select("id");
    record("[class_subject_mappings] User A denied UPDATE School B", (csmBUpd?.length ?? 0) === 0);
    const { data: csmBDel } = await clientA
      .from("class_subject_mappings")
      .delete()
      .eq("id", csmBId)
      .select("id");
    record("[class_subject_mappings] User A denied DELETE School B", (csmBDel?.length ?? 0) === 0);

    // rbac_roles
    const { data: roleBRead } = await clientA.from("rbac_roles").select("id").eq("id", roleBId);
    record("[rbac_roles] User A denied SELECT School B", (roleBRead?.length ?? 0) === 0);
    const { error: roleBIns } = await clientA.from("rbac_roles").insert({
      school_id: SCHOOL_B_ID,
      name: `${SCHOOL_B_CODE}-RogueRole`,
    });
    record("[rbac_roles] User A denied INSERT into School B", Boolean(roleBIns));
    const { data: roleBUpd } = await clientA
      .from("rbac_roles")
      .update({ description: "Hacked" })
      .eq("id", roleBId)
      .select("id");
    record("[rbac_roles] User A denied UPDATE School B", (roleBUpd?.length ?? 0) === 0);
    const { data: roleBDel } = await clientA
      .from("rbac_roles")
      .delete()
      .eq("id", roleBId)
      .select("id");
    record("[rbac_roles] User A denied DELETE School B", (roleBDel?.length ?? 0) === 0);

    // rbac_permissions
    const { data: permBRead } = await clientA.from("rbac_permissions").select("id").eq("id", permBId);
    record("[rbac_permissions] User A denied SELECT School B", (permBRead?.length ?? 0) === 0);
    const { error: permBIns } = await clientA.from("rbac_permissions").insert({
      school_id: SCHOOL_B_ID,
      role_id: roleBId,
      module: "RogueMod",
    });
    record("[rbac_permissions] User A denied INSERT into School B", Boolean(permBIns));
    const { data: permBUpd } = await clientA
      .from("rbac_permissions")
      .update({ can_delete: true })
      .eq("id", permBId)
      .select("id");
    record("[rbac_permissions] User A denied UPDATE School B", (permBUpd?.length ?? 0) === 0);
    const { data: permBDel } = await clientA
      .from("rbac_permissions")
      .delete()
      .eq("id", permBId)
      .select("id");
    record("[rbac_permissions] User A denied DELETE School B", (permBDel?.length ?? 0) === 0);

    // Verify School B data intact via Admin client
    const { data: verifyB } = await admin.from("school_classes").select("id").eq("id", clsBId);
    record("[integrity] School B fixture remains untouched", (verifyB?.length ?? 0) === 1);

    // Storage cross-tenant isolation across all 4 buckets
    console.log("\n=== Cross-Tenant Storage Isolation (4 Private Buckets) ===");
    for (const bucket of ["avatars", "documents", "study-material", "receipts"] as const) {
      const spec = bucketFixtures[bucket];
      const bPath = `${SCHOOL_B_ID}/${userBId}/probe.${spec.ext}`;
      const { data: dlB, error: dlBErr } = await clientA.storage.from(bucket).download(bPath);
      record(`[storage:${bucket}] User A denied download School B`, !dlB && Boolean(dlBErr));

      const { error: upBErr } = await clientA.storage
        .from(bucket)
        .upload(`${SCHOOL_B_ID}/${userAId}/intrusion.${spec.ext}`, spec.data, {
          contentType: spec.mime,
          upsert: true,
        });
      record(`[storage:${bucket}] User A denied upload into School B prefix`, Boolean(upBErr));

      const { data: ownDlB } = await clientB.storage.from(bucket).download(bPath);
      record(`[storage:${bucket}] School B admin CAN download own prefix`, Boolean(ownDlB));
    }

    // Read-only school write lock enforcement
    console.log("\n=== Subscription Read-Only DB Lock ===");
    await admin.from("schools").update({ status: "read_only" }).eq("id", SCHOOL_A_ID);
    const { error: roWriteErr } = await clientA.from("subjects").insert({
      school_id: SCHOOL_A_ID,
      code: `${SCHOOL_A_CODE}-RO-TEST`,
      name: "Blocked Write",
      category: "Core",
    });
    record("[lifecycle:read_only] School A blocked from INSERT when read_only", Boolean(roWriteErr));
  } finally {
    await admin.from("schools").update({ status: "active" }).eq("id", SCHOOL_A_ID);
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`\nTenant Isolation Summary: ${passed} passed, ${failed} failed (total ${results.length})`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Tenant suite failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
