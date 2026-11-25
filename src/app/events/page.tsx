import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, StatusBadge } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "School Events & Academic Calendar 2026–27",
  description:
    "Upcoming parent-teacher meetings, Annual Science Expo, mid-term examinations, and inter-house athletics dates at Greenwood International Academy.",
};

const EVENTS = [
  { date: "08 Dec 2026", title: "Mid-Term Examinations Begin (Grades 6–12)", tag: "Exam", tone: "info" as const },
  { date: "12 Dec 2026", title: "Annual STEM & Robotics Science Expo", tag: "Event", tone: "success" as const },
  { date: "19 Dec 2026", title: "Term 2 Parent-Teacher Meeting (PTM)", tag: "PTM", tone: "primary" as const },
  { date: "10 Jan 2027", title: "Term 3 Tuition & Transport Fee Due Date", tag: "Finance", tone: "warning" as const },
];

export default function PublicEventsPage() {
  return (
    <PublicLayout>
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
          {EVENTS.map((ev) => (
            <Card key={ev.title} className="p-6 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-brand">{ev.date}</span>
                <StatusBadge tone={ev.tone}>{ev.tag}</StatusBadge>
              </div>
              <h2 className="text-base font-bold text-ink">{ev.title}</h2>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

