import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Subject } from "@/types/domain";

export async function listPublicCurriculumSubjects(): Promise<Subject[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subjects")
    .select("id, code, name, category, max_theory, max_practical, periods_per_week, status")
    .is("deleted_at", null)
    .eq("status", "Active")
    .order("code", { ascending: true });

  return (data ?? []).map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    category: r.category,
    maxTheory: r.max_theory,
    maxPractical: r.max_practical,
    periodsPerWeek: r.periods_per_week,
    status: (r.status as Subject["status"]) ?? "Active",
  }));
}
