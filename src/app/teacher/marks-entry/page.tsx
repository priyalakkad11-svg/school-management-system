"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

interface MarkRow {
  id: string;
  rollNo: string;
  name: string;
  theory: number;
  internal: number;
}

const INITIAL_MARKS: MarkRow[] = [
  { id: "m1", rollNo: "01", name: "Aarav Sharma", theory: 74, internal: 19 },
  { id: "m2", rollNo: "02", name: "Ananya Verma", theory: 76, internal: 20 },
  { id: "m3", rollNo: "03", name: "Devansh Patel", theory: 52, internal: 16 },
  { id: "m4", rollNo: "04", name: "Ishita Rao", theory: 66, internal: 18 },
  { id: "m5", rollNo: "05", name: "Kabir Joshi", theory: 38, internal: 14 },
];

function computeGrade(total: number): { grade: string; tone: "success" | "info" | "warning" } {
  if (total >= 90) return { grade: "A+", tone: "success" };
  if (total >= 80) return { grade: "A", tone: "success" };
  if (total >= 65) return { grade: "B+", tone: "info" };
  return { grade: "C", tone: "warning" };
}

export default function TeacherMarksEntryPage() {
  const { showToast } = useToast();
  const [exam, setExam] = React.useState("Mid-Term Exam 2026");
  const [cls, setCls] = React.useState("Class 10–A");
  const [subject, setSubject] = React.useState("Mathematics (Max: 100)");
  const [rows, setRows] = React.useState<MarkRow[]>(INITIAL_MARKS);
  const [locked, setLocked] = React.useState(false);

  const updateMark = (id: string, field: "theory" | "internal", val: number) => {
    const clamped = field === "theory" ? Math.min(80, Math.max(0, val)) : Math.min(20, Math.max(0, val));
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: clamped } : r)));
  };

  return (
    <AppShell
      role="teacher"
      title="Exam Marks Entry"
      subtitle="Enter theory and internal assessment scores with automated grade computation"
    >
      <Card className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-3">
          <Select
            label="Examination"
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            options={[
              { label: "Mid-Term Exam 2026", value: "Mid-Term Exam 2026" },
              { label: "Term 1 Assessment 2026", value: "Term 1 Assessment 2026" },
            ]}
          />
        </div>
        <div className="lg:col-span-3">
          <Select
            label="Class"
            value={cls}
            onChange={(e) => setCls(e.target.value)}
            options={[
              { label: "Class 10–A", value: "Class 10–A" },
              { label: "Class 10–C", value: "Class 10–C" },
            ]}
          />
        </div>
        <div className="lg:col-span-3">
          <Select
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            options={[
              { label: "Mathematics (Max: 100)", value: "Mathematics (Max: 100)" },
              { label: "Applied Calculus (Max: 100)", value: "Applied Calculus (Max: 100)" },
            ]}
          />
        </div>
        <div className="lg:col-span-3 flex flex-wrap gap-2 justify-start lg:justify-end">
          <Button variant="outline" onClick={() => showToast("CSV template validated.")}>
            Import CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setLocked(true);
              showToast(`Marks saved & locked for ${cls} (${exam}).`);
            }}
          >
            {locked ? "Marks Locked" : "Save & Lock Marks"}
          </Button>
        </div>
      </Card>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            Marks Entry Sheet — {cls} (Mathematics)
          </h2>
          <span className="text-xs text-ink-muted">{rows.length} records shown</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Marks entry table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Roll</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Student Name</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Theory (80)</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Internal (20)</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Total (100)</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => {
                const total = row.theory + row.internal;
                const { grade, tone } = computeGrade(total);
                return (
                  <tr key={row.id} className="hover:bg-subtle/60">
                    <td className="py-3 px-4 text-sm font-semibold text-ink">{row.rollNo}</td>
                    <td className="py-3 px-4 text-sm font-medium text-ink">{row.name}</td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        aria-label={`Theory marks for ${row.name}`}
                        disabled={locked}
                        min={0}
                        max={80}
                        value={row.theory}
                        onChange={(e) => updateMark(row.id, "theory", Number(e.target.value) || 0)}
                        className="min-h-10 w-20 rounded-md border border-line bg-surface px-2.5 text-sm text-ink disabled:opacity-60"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        aria-label={`Internal marks for ${row.name}`}
                        disabled={locked}
                        min={0}
                        max={20}
                        value={row.internal}
                        onChange={(e) => updateMark(row.id, "internal", Number(e.target.value) || 0)}
                        className="min-h-10 w-20 rounded-md border border-line bg-surface px-2.5 text-sm text-ink disabled:opacity-60"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-ink">{total} / 100</td>
                    <td className="py-3 px-4">
                      <StatusBadge tone={tone}>{grade}</StatusBadge>
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

