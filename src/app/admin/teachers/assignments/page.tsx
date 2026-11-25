"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const ALLOCATIONS = [
  { id: "al-1", teacher: "Mrs. Kavita Nair", cls: "Class 10–A (Class Teacher)", subject: "Mathematics", periods: "6 / week", room: "Room 204" },
  { id: "al-2", teacher: "Mr. Arjun Menon", cls: "Class 10–A", subject: "Physics", periods: "5 / week", room: "Lab 2" },
  { id: "al-3", teacher: "Ms. Clara D'Souza", cls: "Class 10–A", subject: "English Lang & Lit", periods: "5 / week", room: "Room 204" },
  { id: "al-4", teacher: "Mr. Vikram Rao", cls: "Class 10–A", subject: "Computer Science", periods: "4 / week", room: "CS Lab 1" },
];

export default function TeacherSubjectAssignmentPage() {
  const { showToast } = useToast();
  const [cls, setCls] = React.useState("Class 10–A");

  return (
    <AppShell
      role="admin"
      title="Teacher–Subject–Class Allocation"
      subtitle="Assign faculty members to sections and monitor weekly period loads"
      actions={
        <Button variant="primary" onClick={() => showToast(`Saved faculty allocation for ${cls}.`)}>
          Save Allocation Matrix
        </Button>
      }
    >
      <div className="w-full sm:w-72">
        <Select
          label="Section"
          value={cls}
          onChange={(e) => setCls(e.target.value)}
          options={[
            { label: "Class 10–A", value: "Class 10–A" },
            { label: "Class 9–B", value: "Class 9–B" },
            { label: "Class 12–Sci", value: "Class 12–Sci" },
          ]}
        />
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Faculty Workload — {cls}</h2>
          <span className="text-xs text-ink-muted">{ALLOCATIONS.length} subjects mapped</span>
        </div>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Teacher allocation matrix">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Faculty</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Role / Class</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Subject</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Weekly Load</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Primary Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ALLOCATIONS.map((a) => (
                <tr key={a.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{a.teacher}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{a.cls}</td>
                  <td className="py-3.5 px-4 text-sm text-ink">{a.subject}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone="primary">{a.periods}</StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{a.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

