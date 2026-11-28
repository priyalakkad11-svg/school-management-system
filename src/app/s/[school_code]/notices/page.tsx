import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SchoolMicrositeLayout } from "@/components/layout/SchoolMicrositeLayout";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { getPublicSchoolMicrosite } from "@/lib/school-microsite";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ school_code: string }>;
}): Promise<Metadata> {
  const { school_code } = await params;
  const school = await getPublicSchoolMicrosite(school_code);
  if (!school) return { title: "Notices" };
  return {
    title: `Official Notices | ${school.name}`,
    description: `Latest circulars & announcements from ${school.name} (${school.schoolCode}).`,
  };
}

export default async function SchoolMicrositeNoticesPage({
  params,
}: {
  params: Promise<{ school_code: string }>;
}) {
  const { school_code } = await params;
  const school = await getPublicSchoolMicrosite(school_code);
  if (!school) notFound();

  return (
    <SchoolMicrositeLayout school={school} activeSection="notices">
      <Card className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Notice Board · {school.name}</h1>
          <StatusBadge tone="info">AY {school.activeYearName}</StatusBadge>
        </div>
        <div className="flex flex-col gap-3 text-sm text-ink-secondary">
          <div className="p-4 rounded-md bg-subtle">
            <strong className="text-ink block">Admissions Desk &amp; Campus Timing Circular</strong>
            <span>Admissions &amp; parent desk hours: Monday to Saturday, 8:30 AM – 2:30 PM.</span>
          </div>
          {school.upcomingHolidays.map((h) => (
            <div key={h.id} className="p-4 rounded-md bg-subtle">
              <strong className="text-ink block">{h.title} ({h.category})</strong>
              <span>Scheduled Date: {h.holidayDate}</span>
            </div>
          ))}
        </div>
      </Card>
    </SchoolMicrositeLayout>
  );
}
