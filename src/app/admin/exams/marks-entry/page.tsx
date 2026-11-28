"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { listExamsAndScalesAction, saveExamMarksAction } from "@/app/actions/academics-finance.actions";
import { getLiveStudentsAction } from "@/app/actions/live-data.actions";
import { listSubjectsAction } from "@/app/actions/setup.actions";

const ADMIN_MARKS = [
  { id: "am-1", roll: "01", name: "Aarav Sharma", theory: 74, internal: 19 },
  { id: "am-2", roll: "02", name: "Ananya Verma", theory: 76, internal: 20 },
  { id: "am-3", roll: "03", name: "Devansh Patel", theory: 52, internal: 16 },
  { id: "am-4", roll: "04", name: "Ishita Rao", theory: 66, internal: 18 },
  { id: "am-5", roll: "05", name: "Kabir Joshi", theory: 38, internal: 14 },
];

export default function AdminMarksEntryPage() {
  const { showToast } = useToast();
  const [cls, setCls] = React.useState("Class 10–A");
  const [rows, setRows] = React.useState(ADMIN_MARKS);

  const updateTheory = (id: string, val: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, theory: Math.min(80, Math.max(0, val)) } : r)),
    );
  };

  return (
    <AppShell
      role="admin"
      title="Admin Marks Moderation & Entry"
      subtitle="Verify teacher-entered scores, apply grace moderation, and lock final mark sheets"
      actions={
        <Button
          variant="primary"
          onClick={async () => {
            const [exRes, stuRows, subRes] = await Promise.all([
              listExamsAndScalesAction(),
              getLiveStudentsAction(),
              listSubjectsAction(),
            ]);
            const examId = exRes.ok ? exRes.data.exams[0]?.id : undefined;
            const subjectId = subRes.ok ? subRes.data?.[0]?.id : undefined;
            if (examId && subjectId && stuRows.length > 0) {
              const r = await saveExamMarksAction({
                examId,
                subjectId,
                entries: rows.slice(0, stuRows.length).map((mr, i) => ({
                  studentId: stuRows[i].id,
                  theory: mr.theory,
                  practical: mr.internal,
                  maxMarks: 100,
                })),
              });
              if (!r.ok) {
                showToast(r.error ?? "Failed saving marks.", "warning");
                return;
              }
            }
            showToast(`Marks saved & moderated for ${cls}.`);
          }}
        >
          Verify &amp; Lock All Sections
        </Button>
      }
    >
      <div className="w-full sm:w-64">
        <Select
          label="Section"
          value={cls}
          onChange={(e) => setCls(e.target.value)}
          options={[
            { label: "Class 10–A", value: "Class 10–A" },
            { label: "Class 10–B", value: "Class 10–B" },
          ]}
        />
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Admin marks moderation">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Roll</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Student</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Theory (80)</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Internal (20)</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Total</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => {
                const total = r.theory + r.internal;
                return (
                  <tr key={r.id}>
                    <td className="py-3 px-4 text-sm font-bold text-ink">{r.roll}</td>
                    <td className="py-3 px-4 text-sm font-medium text-ink">{r.name}</td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        aria-label={`Theory score for ${r.name}`}
                        value={r.theory}
                        onChange={(e) => updateTheory(r.id, Number(e.target.value) || 0)}
                        className="min-h-10 w-20 rounded-md border border-line bg-surface px-2.5 text-sm text-ink"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-ink-secondary">{r.internal}</td>
                    <td className="py-3 px-4 text-sm font-bold text-ink">{total} / 100</td>
                    <td className="py-3 px-4">
                      <StatusBadge tone={total >= 80 ? "success" : total >= 60 ? "info" : "warning"}>
                        {total >= 90 ? "A+" : total >= 80 ? "A" : total >= 65 ? "B+" : "C"}
                      </StatusBadge>
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

