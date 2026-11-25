import { AppShell } from "@/components/layout/AppShell";
import { Card, StatusBadge } from "@/components/ui/primitives";

const HOMEWORK_STATUS = [
  { subject: "Mathematics", title: "Quadratic Equations Set #4", assigned: "22 Nov", due: "28 Nov 2026", status: "Pending Upload", tone: "warning" as const, score: "—" },
  { subject: "Physics", title: "Newton's Laws Lab Report", assigned: "23 Nov", due: "30 Nov 2026", status: "In Progress", tone: "info" as const, score: "—" },
  { subject: "English", title: "Shakespeare Critical Essay", assigned: "15 Nov", due: "22 Nov 2026", status: "Submitted", tone: "primary" as const, score: "Awaiting Grade" },
  { subject: "Comp. Science", title: "SQL Joins Practice Sheet", assigned: "10 Nov", due: "18 Nov 2026", status: "Graded", tone: "success" as const, score: "19 / 20" },
];

export default function ParentHomeworkPage() {
  return (
    <AppShell
      role="parent"
      title="Child Homework & Submission Status"
      subtitle="Monitor daily homework deadlines, upload progress, and teacher remarks"
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Aarav Sharma (10–A) — Homework Status</h2>
          <span className="text-xs text-ink-muted">{HOMEWORK_STATUS.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Child homework tracker">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Subject</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Assignment Title</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Assigned</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Due Date</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {HOMEWORK_STATUS.map((hw) => (
                <tr key={hw.title} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{hw.subject}</td>
                  <td className="py-3.5 px-4 text-sm text-ink">{hw.title}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{hw.assigned}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{hw.due}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={hw.tone}>{hw.status}</StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 text-sm font-medium text-ink">{hw.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

