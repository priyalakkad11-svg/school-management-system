import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { CommunicationService } from "@/services/school.service";

export const metadata: Metadata = {
  title: "School Events & Academic Calendar 2026–27",
  description:
    "Upcoming parent-teacher meetings, Annual Science Expo, mid-term examinations, and inter-house athletics dates at Greenwood International Academy.",
};

export default async function PublicEventsPage() {
  const events = await CommunicationService.listEvents(true);
  const firstEvent = events[0];

  return (
    <PublicLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: firstEvent?.title ?? "Annual Campus Academic Showcase",
          startDate: firstEvent?.eventDate ?? "2026-12-12",
          location: {
            "@type": "Place",
            name: firstEvent?.location || "Campus Main Auditorium",
          },
        }}
      />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="self-start">
            <StatusBadge tone="success">Academic Calendar</StatusBadge>
          </span>
          <h1 className="text-3xl font-bold text-ink">Campus Events &amp; Important Dates</h1>
          <p className="text-sm text-ink-secondary">
            Scheduled academic, cultural, and parent engagement milestones for AY 2026–27.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((ev) => (
            <Card key={ev.id} className="p-6 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-brand">{ev.eventDate}</span>
                <StatusBadge tone="info">{ev.category}</StatusBadge>
              </div>
              <h2 className="text-base font-bold text-ink">{ev.title}</h2>
              {ev.description ? <p className="text-xs text-ink-secondary">{ev.description}</p> : null}
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

