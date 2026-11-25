import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { CommunicationService } from "@/services/school.service";

export const metadata: Metadata = {
  title: "Campus Notices & Circulars",
  description:
    "Official school circulars, examination timetables, parent-teacher meeting alerts, and academic notices from Greenwood International Academy.",
};

export default async function PublicNoticesPage() {
  const notices = await CommunicationService.listNotices();

  return (
    <PublicLayout>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="self-start">
            <StatusBadge tone="primary">Official Circulars</StatusBadge>
          </span>
          <h1 className="text-3xl font-bold text-ink">Notice Board &amp; Announcements</h1>
          <p className="text-sm text-ink-secondary">
            Verified notices issued by the Principal Office and Examination Cell.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {notices.map((n) => (
            <Card key={n.id} className="p-6 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <StatusBadge tone={n.category === "Event" ? "success" : "info"}>
                  {n.category}
                </StatusBadge>
                <span className="text-xs text-ink-muted">
                  Published {n.date} • Audience: {n.audience}
                </span>
              </div>
              <h2 className="text-lg font-bold text-ink">{n.title}</h2>
              <p className="text-sm text-ink-secondary">{n.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

