import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { createClient } from "@supabase/supabase-js";
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

async function resolveSeedPassword(): Promise<string> {
  const fromEnv = process.env.SEED_DEFAULT_PASSWORD?.trim();
  if (fromEnv && fromEnv.length >= 8) {
    return fromEnv;
  }
  if (!process.stdin.isTTY) {
    throw new Error(
      "SEED_DEFAULT_PASSWORD (min 8 chars) is required in environment or .env.local when running pnpm seed non-interactively.",
    );
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>((resolve) => {
    rl.question("Enter seed password for demo role accounts (min 8 chars): ", (val) => {
      rl.close();
      resolve(val.trim());
    });
  });
  if (answer.length < 8) {
    throw new Error("Seed password must be at least 8 characters.");
  }
  return answer;
}

const DEMO_SCHOOL_ID = "11111111-1111-4111-8111-111111111111";

interface SeedAccount {
  role: UserRole;
  userCode: string;
  email: string;
  fullName: string;
  initials: string;
  subtitle: string;
  phone: string;
}

const SEED_ACCOUNTS: SeedAccount[] = [
  {
    role: "admin",
    userCode: "ADM-001",
    email: "priya.lakkad@greenwood.edu",
    fullName: "Priya Lakkad",
    initials: "PL",
    subtitle: "Super Admin",
    phone: "+91 98250 44120",
  },
  {
    role: "teacher",
    userCode: "TCH-042",
    email: "kavita.nair@greenwood.edu",
    fullName: "Mrs. Kavita Nair",
    initials: "KN",
    subtitle: "Senior PGT Mathematics",
    phone: "+91 98250 77812",
  },
  {
    role: "student",
    userCode: "ADM-2026-0142",
    email: "aarav.sharma@student.greenwood.edu",
    fullName: "Aarav Sharma",
    initials: "AS",
    subtitle: "Class 10-A • Roll #01",
    phone: "+91 98250 11223",
  },
  {
    role: "parent",
    userCode: "PAR-1042",
    email: "rajesh.sharma@gmail.com",
    fullName: "Mr. Rajesh Sharma",
    initials: "RS",
    subtitle: "Parent (Aarav & Diya)",
    phone: "+91 98250 11223",
  },
  {
    role: "staff",
    userCode: "STF-011",
    email: "mohan.joshi@greenwood.edu",
    fullName: "Mohan Joshi",
    initials: "MJ",
    subtitle: "Head Librarian & Ops",
    phone: "+91 98230 44553",
  },
];

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const password = await resolveSeedPassword();
  const admin = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const existingList = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (existingList.error) throw existingList.error;

  const byEmail = new Map(
    existingList.data.users.map((u) => [u.email?.toLowerCase() ?? "", u]),
  );

  for (const acc of SEED_ACCOUNTS) {
    const existing = byEmail.get(acc.email.toLowerCase());
    let userId: string;

    if (!existing) {
      const created = await admin.auth.admin.createUser({
        email: acc.email,
        password,
        email_confirm: true,
        app_metadata: {
          role: acc.role,
          school_id: DEMO_SCHOOL_ID,
          user_code: acc.userCode,
          full_name: acc.fullName,
          subtitle: acc.subtitle,
        },
        user_metadata: {
          full_name: acc.fullName,
        },
      });
      if (created.error || !created.data.user) {
        throw created.error ?? new Error(`Failed to create ${acc.email}`);
      }
      userId = created.data.user.id;
    } else {
      userId = existing.id;
      const updated = await admin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        app_metadata: {
          role: acc.role,
          school_id: DEMO_SCHOOL_ID,
          user_code: acc.userCode,
          full_name: acc.fullName,
          subtitle: acc.subtitle,
        },
      });
      if (updated.error) throw updated.error;
    }

    const { error: profileErr } = await admin.from("profiles").upsert(
      {
        id: userId,
        school_id: DEMO_SCHOOL_ID,
        user_code: acc.userCode,
        email: acc.email,
        full_name: acc.fullName,
        role: acc.role,
        initials: acc.initials,
        subtitle: acc.subtitle,
        phone: acc.phone,
        status: "Active",
        must_change_password: false,
      },
      { onConflict: "id" },
    );
    if (profileErr) throw profileErr;

    console.log(`Seeded [${acc.role}] ${acc.userCode} (${acc.email})`);
  }

  console.log("Seed completed for all 5 portal roles.");
}

main().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
