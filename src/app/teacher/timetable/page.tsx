"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import type { StatusTone } from "@/types/domain";

interface SlotBadge {
  label: string;
  tone?: StatusTone;
}

const TIMETABLE_ROWS: { day: string; slots: SlotBadge[] }[] = [
  {
    day: "Monday",
    slots: [
      { label: "10–A Math", tone: "primary" },
      { label: "9–B Math", tone: "info" },
      { label: "Free Prep" },
      { label: "12–Sci Calc", tone: "success" },
      { label: "10–C Math", tone: "primary" },
    ],
  },
  {
    day: "Tuesday",
    slots: [
      { label: "9–B Math", tone: "info" },
      { label: "11–Com Stat", tone: "warning" },
      { label: "10–A Math", tone: "primary" },
      { label: "Dept Meeting" },
      { label: "12–Sci Calc", tone: "success" },
    ],
  },
  {
    day: "Wednesday",
    slots: [
      { label: "10–A Math", tone: "primary" },
      { label: "10–C Math", tone: "primary" },
      { label: "Free Prep" },
      { label: "9–B Math", tone: "info" },
      { label: "11–Com Stat", tone: "warning" },
    ],
  },
  {
    day: "Thursday",
    slots: [
      { label: "12–Sci Calc", tone: "success" },
      { label: "10–A Math", tone: "primary" },
      { label: "9–B Math", tone: "info" },
      { label: "Lab Assist" },
      { label: "10–C Math", tone: "primary" },
    ],
  },
  {
    day: "Friday",
    slots: [
      { label: "10–C Math", tone: "primary" },
      { label: "12–Sci Calc", tone: "success" },
      { label: "11–Com Stat", tone: "warning" },
      { label: "10–A Math", tone: "primary" },
      { label: "Remedial" },
    ],
  },
];

export default function TeacherTimetablePage() {
  return (
    <AppShell
      role="teacher"
      title="My Weekly Timetable"
      subtitle="Weekly Schedule • Mrs. Kavita Nair (26 Periods / Week)"
      actions={
        <Button variant="outline" onClick={() => window.print()}>
          Download PDF Timetable
        </Button>
      }
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Monday – Saturday Grid</h2>
          <span className="text-xs text-ink-muted">5 days active</span>
        </div>

        <div className="hidden md:block overflow-x-auto" tabIndex={0} role="region" aria-label="Weekly timetable">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Day</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">P1 (08:30)</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">P2 (09:20)</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">P3 (10:25)</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">P4 (11:30)</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">P5 (12:45)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {TIMETABLE_ROWS.map((row) => (
                <tr key={row.day}>
                  <td className="py-3.5 px-4 text-sm font-bold text-ink">{row.day}</td>
                  {row.slots.map((slot, idx) => (
                    <td key={`${row.day}-${idx}`} className="py-3.5 px-4 text-sm">
                      {slot.tone ? (
                        <StatusBadge tone={slot.tone}>{slot.label}</StatusBadge>
                      ) : (
                        <span className="text-ink-secondary">{slot.label}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden flex flex-col gap-3">
          {TIMETABLE_ROWS.map((row) => (
            <div key={row.day} className="rounded-md border border-line p-4 flex flex-col gap-2">
              <div className="text-sm font-bold text-ink">{row.day}</div>
              <div className="flex flex-wrap gap-2">
                {row.slots.map((slot, idx) =>
                  slot.tone ? (
                    <StatusBadge key={`${row.day}-m-${idx}`} tone={slot.tone}>
                      P{idx + 1}: {slot.label}
                    </StatusBadge>
                  ) : (
                    <StatusBadge key={`${row.day}-m-${idx}`} tone="neutral">
                      P{idx + 1}: {slot.label}
                    </StatusBadge>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}

