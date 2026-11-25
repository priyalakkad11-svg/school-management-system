import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/primitives";

const SCHEDULE = [
  { day: "Monday", p1: "Mathematics", p2: "Physics", p3: "English", p4: "Comp. Science", p5: "Chemistry" },
  { day: "Tuesday", p1: "History", p2: "Mathematics", p3: "Biology", p4: "Hindi / French", p5: "P.E. / Sports" },
  { day: "Wednesday", p1: "Mathematics", p2: "Chemistry", p3: "Physics Lab", p4: "Physics Lab", p5: "English" },
  { day: "Thursday", p1: "Geography", p2: "Mathematics", p3: "Comp. Science", p4: "English", p5: "Art & Design" },
  { day: "Friday", p1: "Physics", p2: "Chemistry", p3: "Mathematics", p4: "Library", p5: "Club Hour" },
];

export default function StudentTimetablePage() {
  return (
    <AppShell
      role="student"
      title="Class 10–A Weekly Timetable"
      subtitle="Class 10–A Schedule • Class Teacher: Mrs. Kavita Nair"
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            Class 10–A Schedule • Class Teacher: Mrs. Kavita Nair
          </h2>
          <span className="text-xs text-ink-muted">5 entries</span>
        </div>

        <div className="hidden md:block overflow-x-auto" tabIndex={0} role="region" aria-label="Weekly class timetable">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Day</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">08:30–09:15</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">09:20–10:05</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">10:25–11:10</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">11:30–12:15</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">12:45–01:30</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {SCHEDULE.map((row) => (
                <tr key={row.day} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-bold text-ink">{row.day}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.p1}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.p2}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.p3}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.p4}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.p5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden flex flex-col gap-3">
          {SCHEDULE.map((row) => (
            <div key={row.day} className="rounded-md border border-line p-4 flex flex-col gap-1.5">
              <div className="text-sm font-bold text-ink">{row.day}</div>
              <p className="text-xs text-ink-secondary">
                {row.p1} • {row.p2} • {row.p3} • {row.p4} • {row.p5}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}

