import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/db";

const DEMO_SCHOOL_ID = "11111111-1111-4111-8111-111111111111";

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

async function promptHiddenPassword(question: string): Promise<string> {
  if (!process.stdin.isTTY) {
    throw new Error(
      "Interactive TTY required to enter super admin password at runtime. Never hardcode super_admin credentials in files.",
    );
  }

  return await new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (val) => {
      rl.close();
      resolve(val.trim());
    });
  });
}

function validatePassword(pw: string) {
  if (pw.length < 12) {
    throw new Error("Super admin password must be at least 12 characters long.");
  }
  if (!/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/\d/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) {
    throw new Error(
      "Super admin password must contain uppercase, lowercase, digit, and symbol.",
    );
  }
}

async function main() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }
  if (!superAdminEmail || !superAdminEmail.includes("@")) {
    throw new Error(
      "Missing or invalid SUPER_ADMIN_EMAIL in .env.local / environment. Set SUPER_ADMIN_EMAIL=<your-email> before running pnpm seed:superadmin.",
    );
  }

  const password = await promptHiddenPassword(
    `Enter strong password for Super Admin (${superAdminEmail}, min 12 chars + upper/lower/digit/symbol): `,
  );
  validatePassword(password);

  const admin = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: usersList, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) throw listErr;

  const existing = usersList.users.find(
    (u) => u.email?.toLowerCase() === superAdminEmail,
  );

  let userId: string;
  if (existing) {
    const { error: updErr } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      app_metadata: {
        ...(existing.app_metadata ?? {}),
        role: "super_admin",
        school_id: DEMO_SCHOOL_ID,
        user_code: "PLATFORM-01",
        full_name: "Priya Lakkad",
        subtitle: "Platform Owner (Super Admin)",
      },
      user_metadata: { full_name: "Priya Lakkad" },
    });
    if (updErr) throw updErr;
    userId = existing.id;
  } else {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: superAdminEmail,
      password,
      email_confirm: true,
      app_metadata: {
        role: "super_admin",
        school_id: DEMO_SCHOOL_ID,
        user_code: "PLATFORM-01",
        full_name: "Priya Lakkad",
        subtitle: "Platform Owner (Super Admin)",
      },
      user_metadata: { full_name: "Priya Lakkad" },
    });
    if (createErr || !created.user) {
      throw createErr ?? new Error("Failed to create super_admin user.");
    }
    userId = created.user.id;
  }

  const { error: profileErr } = await admin.from("profiles").upsert(
    {
      id: userId,
      school_id: DEMO_SCHOOL_ID,
      user_code: "PLATFORM-01",
      email: superAdminEmail,
      full_name: "Priya Lakkad",
      role: "super_admin",
      initials: "PL",
      subtitle: "Platform Owner (Super Admin)",
      status: "Active",
      must_change_password: false,
      two_factor_enabled: true,
    },
    { onConflict: "id" },
  );
  if (profileErr) throw profileErr;

  console.log(`Bootstrapped [super_admin] PLATFORM-01 (${superAdminEmail})`);
}

main().catch((err) => {
  console.error("Super admin bootstrap failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
