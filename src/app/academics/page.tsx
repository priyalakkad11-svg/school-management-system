import type { Metadata } from "next";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { AcademicService, SchoolSetupService } from "@/services/school.service";

export const metadata: Metadata = {
  title: "Academics & K-12 Curriculum",
  description:
    "Explore Greenwood International Academy K-12 CBSE & IB streams, STEM laboratories, core subjects, and 2026-27 assessment calendar.",
};

export default async function AcademicsPage() {
  const [subjects, exams] = await Promise.all([
    SchoolSetupService.listSubjects(),
    AcademicService.listExams(),
  ]);

  return (
    <PublicLayout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col gap-8">
        <div className="max-w-3xl flex flex-col gap-3">
          <span className="self-start">
            <StatusBadge tone="info">K–12 Academics</StatusBadge>
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink">
            Curriculum, Subjects &amp; Assessment Calendar
          </h1>
          <p className="text-base text-ink-secondary">
            Balanced blend of foundational mastery, STEM inquiry, languages, and board readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => (
            <Card key={sub.id} className="p-5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <StatusBadge tone="primary">{sub.code}</StatusBadge>
                <span className="text-xs font-medium text-ink-secondary">
                  {sub.periodsPerWeek} periods/week
                </span>
              </div>
              <h2 className="text-base font-bold text-ink">{sub.name}</h2>
              <p className="text-xs text-ink-secondary">
                {sub.category} • Theory {sub.maxTheory} / Practical {sub.maxPractical}
              </p>
            </Card>
          ))}
        </div>

        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-ink">2026–27 Examination Milestones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exams.map((ex) => (
              <div key={ex.id} className="rounded-md bg-subtle p-4 flex flex-col gap-1">
                <span className="text-xs font-semibold text-brand">{ex.dateWindow}</span>
                <div className="text-sm font-bold text-ink">{ex.name}</div>
                <span className="text-xs text-ink-secondary">{ex.classes}</span>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <Link href="/apply">
              <Button variant="primary">Apply for 2026–27 Admission</Button>
            </Link>
          </div>
        </Card>
      </section>
    </PublicLayout>
  );
}

