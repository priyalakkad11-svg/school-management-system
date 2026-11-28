import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/db";

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

interface ScaleSchoolSpec {
  id: string;
  uuidTag: string;
  school_code: string;
  name: string;
  board: string;
  grades: { name: string; order: number; wing: string }[];
  studentCount: number;
}

const SCALE_SCHOOLS: ScaleSchoolSpec[] = [
  {
    id: "22222222-2222-4222-8222-222222222001",
    uuidTag: "a001",
    school_code: "SPA01",
    name: "Sunrise Public Academy",
    board: "CBSE",
    grades: [
      { name: "Nursery", order: 1, wing: "Pre-Primary" },
      { name: "LKG", order: 2, wing: "Pre-Primary" },
      { name: "UKG", order: 3, wing: "Pre-Primary" },
      ...Array.from({ length: 10 }, (_, i) => ({
        name: `Class ${i + 1}`,
        order: i + 4,
        wing: i < 5 ? "Primary" : i < 8 ? "Middle" : "Secondary",
      })),
    ],
    studentCount: 3400,
  },
  {
    id: "22222222-2222-4222-8222-222222222002",
    uuidTag: "a002",
    school_code: "BVM02",
    name: "Bharati Vidya Mandir",
    board: "ICSE",
    grades: Array.from({ length: 10 }, (_, i) => ({
      name: `Class ${i + 1}`,
      order: i + 1,
      wing: i < 5 ? "Primary" : i < 8 ? "Middle" : "Secondary",
    })),
    studentCount: 3300,
  },
  {
    id: "22222222-2222-4222-8222-222222222003",
    uuidTag: "0000",
    school_code: "NHS03",
    name: "National Heritage Sr. Sec. School",
    board: "CBSE",
    grades: Array.from({ length: 12 }, (_, i) => ({
      name: `Class ${i + 1}`,
      order: i + 1,
      wing: i < 5 ? "Primary" : i < 8 ? "Middle" : i < 10 ? "Secondary" : "Senior Secondary",
    })),
    studentCount: 3500,
  },
];

const FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Ananya", "Diya", "Isha", "Kavya", "Riya", "Rohan", "Kabir"];
const LAST_NAMES = ["Sharma", "Verma", "Patel", "Mehta", "Joshi", "Rao", "Nair", "Deshmukh", "Kulkarni", "Gupta"];
const SECTIONS = ["A", "B", "C", "D"];

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: plan } = await admin.from("saas_plans").select("id").limit(1).single();
  let totalInserted = 0;

  for (const spec of SCALE_SCHOOLS) {
    const { error: schErr } = await admin.from("schools").upsert(
      {
        id: spec.id,
        school_code: spec.school_code,
        name: spec.name,
        board: spec.board,
        status: "active",
        is_demo: false,
        timezone: "Asia/Kolkata",
        currency: "INR",
      },
      { onConflict: "id" },
    );
    if (schErr) throw new Error(`School upsert failed: ${schErr.message}`);

    if (plan) {
      const { error: subErr } = await admin.from("school_subscriptions").upsert(
        {
          school_id: spec.id,
          plan_id: plan.id,
          status: "active",
          billing_cycle: "yearly",
          student_count_tier: spec.studentCount,
          monthly_rate_inr: spec.studentCount * 40,
        },
        { onConflict: "school_id" },
      );
      if (subErr) throw new Error(`Sub upsert failed: ${subErr.message}`);
    }

    const schoolPrefix = `${spec.id.slice(0, 24)}${spec.uuidTag}`; // disjoint 28-char UUID prefix per school
    const { data: ayRow, error: ayErr } = await admin
      .from("academic_years")
      .upsert(
        {
          school_id: spec.id,
          code: `${spec.school_code}-AY26`,
          name: "AY 2026-27",
          start_label: "Apr 2026",
          end_label: "Mar 2027",
          start_date: "2026-04-01",
          end_date: "2027-03-31",
          status: "Active",
        },
        { onConflict: "code" },
      )
      .select("id")
      .single();
    if (ayErr || !ayRow) throw new Error(`Academic year upsert failed: ${ayErr?.message}`);
    const ayId = ayRow.id;

    const classIds: string[] = [];
    for (let idx = 0; idx < spec.grades.length; idx++) {
      const g = spec.grades[idx];
      const { data: clsRow, error: clsErr } = await admin
        .from("school_classes")
        .upsert(
          {
            school_id: spec.id,
            code: `${spec.school_code}-G${String(idx + 1).padStart(2, "0")}`,
            name: g.name,
            grade_order: Math.min(12, Math.max(1, g.order)),
            wing: g.wing,
            sections: SECTIONS,
            capacity: 180,
            room_block: `${g.wing} Block`,
            status: "Active",
          },
          { onConflict: "code" },
        )
        .select("id")
        .single();
      if (clsErr || !clsRow) throw new Error(`Class upsert failed: ${clsErr?.message}`);
      classIds.push(clsRow.id);
    }

    const chunkSize = 500;
    const today = new Date().toISOString().slice(0, 10);
    for (let start = 0; start < spec.studentCount; start += chunkSize) {
      const end = Math.min(spec.studentCount, start + chunkSize);
      const batch: Database["public"]["Tables"]["students"]["Insert"][] = [];
      for (let i = start; i < end; i++) {
        const clsId = classIds[i % classIds.length];
        const first = FIRST_NAMES[i % FIRST_NAMES.length];
        const last = LAST_NAMES[(i + Math.floor(i / 10)) % LAST_NAMES.length];
        const section = SECTIONS[i % SECTIONS.length];
        const due = i % 4 === 0 ? 18500 : i % 7 === 0 ? 9200 : 0;
        const studentUuid = `${schoolPrefix}${String(i + 1).padStart(8, "0")}`;
        batch.push({
          id: studentUuid,
          school_id: spec.id,
          academic_year_id: ayId,
          class_id: clsId,
          admission_no: `${spec.school_code}-${String(i + 1).padStart(5, "0")}`,
          roll_no: String((i % 45) + 1).padStart(2, "0"),
          full_name: `${first} ${last}`,
          section_name: section,
          gender: i % 2 === 0 ? "Male" : "Female",
          fee_balance_inr: due,
          status: "Active",
        });
      }

      const { data: upserted, error } = await admin
        .from("students")
        .upsert(batch, { onConflict: "id" })
        .select("id");
      if (error) throw new Error(`Batch insert failed for ${spec.school_code}: ${error.message}`);

      // Seed 1 attendance record per student in first chunk for realistic index volume
      if (upserted && upserted.length > 0 && start < 1500) {
        const attBatch: Database["public"]["Tables"]["student_attendance"]["Insert"][] = upserted.map((s, idx) => ({
          school_id: spec.id,
          student_id: s.id,
          attendance_date: today,
          status: idx % 15 === 0 ? "Absent" : "Present",
        }));
        await admin
          .from("student_attendance")
          .upsert(attBatch, { onConflict: "school_id,student_id,attendance_date" });
      }

      totalInserted += batch.length;
    }

    console.log(`Seeded ${spec.studentCount} students for ${spec.name} (${spec.school_code})`);
  }

  console.log(`Scale seed completed cleanly: ${totalInserted} students across ${SCALE_SCHOOLS.length} schools.`);
}

main().catch((err) => {
  console.error("seed:scale error:", err);
  process.exit(1);
});
