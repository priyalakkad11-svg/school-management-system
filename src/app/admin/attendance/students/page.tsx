"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { MOCK_STUDENTS } from "@/mocks/school.data";

export default function AdminStudentAttendancePage() {
  const { showToast } = useToast();
  const [cls, setCls] = React.useState("Class 10–A");
  const [date, setDate] = React.useState("2026-11-25");
  const [marks, setMarks] = React.useState<Record<string, "Present" | "Absent" | "Late">>({
    "stu-1": "Present",
    "stu-2": "Present",
    "stu-3": "Absent",
    "stu-4": "Late",
    "stu-5": "Present",
  });

  const cycle = (id: string) => {
    const order: ("Present" | "Absent" | "Late")[] = ["Present", "Absent", "Late"];
    setMarks((prev) => {
      const cur = prev[id] ?? "Present";
      return { ...prev, [id]: order[(order.indexOf(cur) + 1) % order.length] };
    });
  };

  return (
    <AppShell
      role="admin"
      title="Student Attendance (Class-wise)"
      subtitle="Monitor and override section attendance registers across Grades Nursery–12"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              const next: Record<string, "Present" | "Absent" | "Late"> = {};
              MOCK_STUDENTS.forEach((s) => {
                next[s.id] = "Present";
              });
              setMarks(next);
              showToast("All students marked Present.");
            }}
          >
            Mark All Present
          </Button>
          <Button variant="primary" onClick={() => showToast(`Saved ${cls} register for ${date}.`)}>
            Lock &amp; Notify Parents
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <Select
          label="Class & Section"
          value={cls}
          onChange={(e) => setCls(e.target.value)}
          options={[
            { label: "Class 10–A", value: "Class 10–A" },
            { label: "Class 10–B", value: "Class 10–B" },
            { label: "Class 9–A", value: "Class 9–A" },
          ]}
        />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Class attendance table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Roll No</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Admission ID</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Student Name</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Guardian Mobile</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {MOCK_STUDENTS.slice(0, 5).map((s) => {
                const st = marks[s.id] ?? "Present";
                return (
                  <tr key={s.id} className="hover:bg-subtle/60">
                    <td className="py-3.5 px-4 text-sm font-bold text-ink">{s.rollNo}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{s.admissionId}</td>
                    <td className="py-3.5 px-4 text-sm font-medium text-ink">{s.name}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{s.parentPhone}</td>
                    <td className="py-3.5 px-4">
                      <button type="button" onClick={() => cycle(s.id)} className="cursor-pointer rounded-full">
                        <StatusBadge
                          tone={st === "Present" ? "success" : st === "Late" ? "warning" : "danger"}
                        >
                          {st}
                        </StatusBadge>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

