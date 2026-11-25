"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";

const CLASS_GRID = [
  { day: "Monday", p1: "Math (KN)", p2: "Physics (AM)", p3: "English (CD)", p4: "CS (VR)", p5: "Chem (SK)" },
  { day: "Tuesday", p1: "History", p2: "Math (KN)", p3: "Bio", p4: "French", p5: "Sports" },
  { day: "Wednesday", p1: "Math (KN)", p2: "Chem (SK)", p3: "Physics Lab", p4: "Physics Lab", p5: "English (CD)" },
  { day: "Thursday", p1: "Geo", p2: "Math (KN)", p3: "CS (VR)", p4: "English (CD)", p5: "Art" },
  { day: "Friday", p1: "Physics (AM)", p2: "Chem (SK)", p3: "Math (KN)", p4: "Library", p5: "Club" },
];

export default function AdminClassTimetableViewPage() {
  const [cls, setCls] = React.useState("Class 10–A");

  return (
    <AppShell
      role="admin"
      title="Class Timetable Master View"
      subtitle="Inspect conflict-free weekly period grids for every academic section"
      actions={
        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/timetable/builder">
            <Button variant="primary">Edit Timetable</Button>
          </Link>
          <Button variant="outline" onClick={() => window.print()}>
            Print Grid
          </Button>
        </div>
      }
    >
      <div className="w-full sm:w-64">
        <Select
          label="Section"
          value={cls}
          onChange={(e) => setCls(e.target.value)}
          options={[
            { label: "Class 10–A", value: "Class 10–A" },
            { label: "Class 9–B", value: "Class 9–B" },
          ]}
        />
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">{cls} Weekly Timetable</h2>
          <StatusBadge tone="success">Zero Teacher Clashes</StatusBadge>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Admin class timetable">
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
              {CLASS_GRID.map((row) => (
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
      </Card>
    </AppShell>
  );
}

