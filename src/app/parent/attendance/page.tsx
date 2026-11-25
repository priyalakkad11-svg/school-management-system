"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";

const ATTENDANCE_LOG = [
  { date: "25 Nov 2026", day: "Wednesday", gate: "08:22 AM", status: "Present", tone: "success" as const, note: "—" },
  { date: "24 Nov 2026", day: "Tuesday", gate: "08:19 AM", status: "Present", tone: "success" as const, note: "—" },
  { date: "23 Nov 2026", day: "Monday", gate: "08:40 AM", status: "Late", tone: "warning" as const, note: "Bus Route #04 traffic" },
  { date: "20 Nov 2026", day: "Friday", gate: "08:21 AM", status: "Present", tone: "success" as const, note: "—" },
  { date: "19 Nov 2026", day: "Thursday", gate: "—", status: "Approved Leave", tone: "info" as const, note: "Family function" },
];

export default function ParentAttendancePage() {
  const [child, setChild] = React.useState("Aarav Sharma (Class 10–A)");
  const [month, setMonth] = React.useState("November 2026");

  return (
    <AppShell
      role="parent"
      title="Child Attendance Tracker"
      subtitle="Daily RFID gate check-in timestamps and approved leave history"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
          <Select
            label="Child"
            value={child}
            onChange={(e) => setChild(e.target.value)}
            options={[
              { label: "Aarav Sharma (Class 10–A)", value: "Aarav Sharma (Class 10–A)" },
              { label: "Diya Sharma (Class 6–C)", value: "Diya Sharma (Class 6–C)" },
            ]}
          />
          <Select
            label="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            options={[
              { label: "November 2026", value: "November 2026" },
              { label: "October 2026", value: "October 2026" },
            ]}
          />
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          Download Attendance Certificate
        </Button>
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            Daily Attendance Log — {month} ({child.split(" ")[0]})
          </h2>
          <span className="text-xs text-ink-muted">{ATTENDANCE_LOG.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Child daily attendance">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Date</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Day</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Gate Check-In</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Teacher Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ATTENDANCE_LOG.map((row) => (
                <tr key={row.date} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{row.date}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.day}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.gate}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

