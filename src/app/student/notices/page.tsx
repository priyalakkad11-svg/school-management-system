import { AppShell } from "@/components/layout/AppShell";
import { Card, StatusBadge } from "@/components/ui/primitives";

const STUDENT_NOTICES = [
  {
    title: "Annual Science & Robotics Expo 2026",
    meta: "12 Dec 2026 • Main Auditorium",
    body: "Project abstracts for Grades 8–12 must be submitted to Science Dept by Dec 02.",
    tag: "Event",
    tone: "primary" as const,
  },
  {
    title: "Mid-Term Exam Guidelines Released",
    meta: "08–17 Dec 2026 • Exam Cell",
    body: "Students must carry printed Admit Card and arrive 20 minutes before exam start.",
    tag: "Important",
    tone: "warning" as const,
  },
  {
    title: "Winter Uniform Transition Notice",
    meta: "Effective 01 Dec 2026",
    body: "Blazers and navy sweaters mandatory during morning assembly.",
    tag: "Circular",
    tone: "info" as const,
  },
];

const HOLIDAYS = [
  "25 Dec 2026 — Christmas Day",
  "26 Dec – 03 Jan — Winter Break",
  "26 Jan 2027 — Republic Day",
];

export default function StudentNoticesPage() {
  return (
    <AppShell
      role="student"
      title="School Notices & Events Calendar"
      subtitle="Official school circulars, exam notifications, and upcoming holidays"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-4">
          {STUDENT_NOTICES.map((n) => (
            <Card key={n.title} className="p-5 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-bold text-ink">{n.title}</h2>
                <StatusBadge tone={n.tone}>{n.tag}</StatusBadge>
              </div>
              <div className="text-xs font-semibold text-brand">{n.meta}</div>
              <p className="text-sm text-ink-secondary">{n.body}</p>
            </Card>
          ))}
        </div>

        <Card className="lg:col-span-4 p-6 flex flex-col gap-3">
          <h2 className="text-base font-bold text-ink">Upcoming Holidays</h2>
          <ul className="flex flex-col gap-2.5 text-sm text-ink-secondary">
            {HOLIDAYS.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
