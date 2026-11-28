import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SchoolMicrositeLayout } from "@/components/layout/SchoolMicrositeLayout";
import { Card } from "@/components/ui/primitives";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicSchoolMicrosite } from "@/lib/school-microsite";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ school_code: string }>;
}): Promise<Metadata> {
  const { school_code } = await params;
  const school = await getPublicSchoolMicrosite(school_code);
  if (!school) return { title: "Events" };
  return {
    title: `Academic Calendar & Events | ${school.name}`,
    description: `Upcoming events, holidays & academic milestones at ${school.name}.`,
  };
}

export default async function SchoolMicrositeEventsPage({
  params,
}: {
  params: Promise<{ school_code: string }>;
}) {
  const { school_code } = await params;
  const school = await getPublicSchoolMicrosite(school_code);
  if (!school) notFound();

  const eventsList =
    school.upcomingHolidays.length > 0
      ? school.upcomingHolidays
      : [
          {
            id: "orientation",
            title: `Academic Session ${school.activeYearName} Orientation`,
            holidayDate: "2026-04-06",
            category: "Academic",
          },
        ];

  const eventSchemas = eventsList.map((ev) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.title,
    startDate: ev.holidayDate,
    organizer: { "@type": "EducationalOrganization", name: school.name },
    location: { "@type": "Place", name: school.name, address: school.address },
  }));

  return (
    <SchoolMicrositeLayout school={school} activeSection="events">
      <JsonLd data={eventSchemas} />
      <Card className="p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-ink">Events &amp; Calendar · {school.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eventsList.map((ev) => (
            <Card key={ev.id} className="p-4 flex flex-col gap-1">
              <span className="text-xs font-semibold text-brand">{ev.category}</span>
              <strong className="text-base text-ink">{ev.title}</strong>
              <span className="text-xs text-ink-secondary">{ev.holidayDate}</span>
            </Card>
          ))}
        </div>
      </Card>
    </SchoolMicrositeLayout>
  );
}
