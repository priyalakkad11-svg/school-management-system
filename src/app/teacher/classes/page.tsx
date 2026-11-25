import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";

const ASSIGNED_CLASSES = [
  {
    id: "10-a",
    students: "40 Students",
    title: "Class 10–A (Class Teacher)",
    subject: "Mathematics • 6 hrs/wk",
    stats: "86.4% Avg • 96% Attendance",
  },
  {
    id: "10-c",
    students: "38 Students",
    title: "Class 10–C",
    subject: "Mathematics • 5 hrs/wk",
    stats: "81.2% Avg • 93% Attendance",
  },
  {
    id: "9-b",
    students: "36 Students",
    title: "Class 9–B",
    subject: "Mathematics • 5 hrs/wk",
    stats: "79.5% Avg • 94% Attendance",
  },
  {
    id: "12-sci",
    students: "32 Students",
    title: "Class 12–Science",
    subject: "Applied Calculus • 6 hrs/wk",
    stats: "89.1% Avg • 97% Attendance",
  },
  {
    id: "11-com",
    students: "34 Students",
    title: "Class 11–Commerce",
    subject: "Statistics • 4 hrs/wk",
    stats: "82.0% Avg • 91% Attendance",
  },
];

export default function TeacherClassesPage() {
  return (
    <AppShell
      role="teacher"
      title="My Assigned Classes"
      subtitle="Subject sections, weekly periods, attendance averages, and quick rosters"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ASSIGNED_CLASSES.map((cls) => (
          <Card key={cls.id} className="p-6 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="self-start">
                <StatusBadge tone="primary">{cls.students}</StatusBadge>
              </span>
              <h2 className="text-lg font-bold text-ink pt-1">{cls.title}</h2>
              <p className="text-sm text-ink-secondary">{cls.subject}</p>
              <p className="text-xs font-semibold text-success">{cls.stats}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link href="/teacher/attendance">
                <Button variant="primary" size="sm">
                  Mark Attendance
                </Button>
              </Link>
              <Link href="/teacher/students">
                <Button variant="outline" size="sm">
                  Students
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

