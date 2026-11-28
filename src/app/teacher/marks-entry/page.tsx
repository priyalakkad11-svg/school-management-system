"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  listPortalAcademicDataAction,
  saveExamMarksAction,
} from "@/app/actions/academics-finance.actions";

interface MarkRow {
  id: string;
  rollNo: string;
  name: string;
  theory: number;
  internal: number;
}

function computeGrade(total: number): { grade: string; tone: "success" | "info" | "warning" } {
  if (total >= 90) return { grade: "A1", tone: "success" };
  if (total >= 80) return { grade: "A2", tone: "success" };
  if (total >= 65) return { grade: "B1", tone: "info" };
  return { grade: "C1", tone: "warning" };
}

export default function TeacherMarksEntryPage() {
  const { showToast } = useToast();
  const [examOptions, setExamOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [subjectOptions, setSubjectOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [examId, setExamId] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [rows, setRows] = React.useState<MarkRow[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    void listPortalAcademicDataAction().then((res) => {
      if (!active || !res.ok || !res.data) return;
      const eOpts = res.data.exams.map((ex) => ({ label: ex.name, value: ex.id }));
      const sOpts = res.data.subjects.map((sub) => ({ label: sub.name, value: sub.id }));
      setExamOptions(eOpts);
      setSubjectOptions(sOpts);
      if (eOpts[0]) setExamId(eOpts[0].value);
      if (sOpts[0]) setSubjectId(sOpts[0].value);
      const existingMap = new Map(
        res.data.marks.map((m) => [m.student_id, { theory: Number(m.theory_marks), internal: Number(m.practical_marks) }]),
      );
      setRows(
        res.data.students.slice(0, 25).map((stu) => {
          const ex = existingMap.get(stu.id);
          return {
            id: stu.id,
            rollNo: stu.roll_no || "01",
            name: stu.full_name,
            theory: ex?.theory ?? 70,
            internal: ex?.internal ?? 18,
          };
        }),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  const updateMark = (id: string, field: "theory" | "internal", val: number) => {
    const clamped = field === "theory" ? Math.min(80, Math.max(0, val)) : Math.min(20, Math.max(0, val));
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: clamped } : r)));
  };

  const handleSave = async () => {
    if (!examId || !subjectId || rows.length === 0) {
      showToast("Select examination, subject, and student rows.", "warning");
      return;
    }
    setSaving(true);
    const res = await saveExamMarksAction({
      examId,
      subjectId,
      entries: rows.map((r) => ({
        studentId: r.id,
        theory: r.theory,
        practical: r.internal,
        maxMarks: 100,
      })),
    });
    setSaving(false);
    if (!res.ok) {
      showToast(res.error ?? "Unable to save marks.", "warning");
      return;
    }
    showToast(`Saved ${rows.length} marksheet entries to Supabase.`, "success");
  };

  return (
    <AppShell
      role="teacher"
      title="Exam Marks Entry"
      subtitle="Enter theory and internal assessment scores with automated grade computation"
    >
      <Card className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-4">
          <Select
            label="Examination"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            options={examOptions.length ? examOptions : [{ label: "Loading exams...", value: "" }]}
          />
        </div>
        <div className="lg:col-span-4">
          <Select
            label="Subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            options={subjectOptions.length ? subjectOptions : [{ label: "Loading subjects...", value: "" }]}
          />
        </div>
        <div className="lg:col-span-4 flex flex-wrap gap-2 justify-start lg:justify-end">
          <Button variant="primary" disabled={saving || !examId || !subjectId} onClick={() => void handleSave()}>
            {saving ? "Saving..." : "Save Marks"}
          </Button>
        </div>
      </Card>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Marks Entry Sheet</h2>
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
                        min={0}
                        max={80}
                        value={row.theory}
                        onChange={(e) => updateMark(row.id, "theory", Number(e.target.value) || 0)}
                        className="min-h-10 w-20 rounded-md border border-line bg-surface px-2.5 text-sm text-ink"
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <input
                        type="number"
                        aria-label={`Internal marks for ${row.name}`}
                        min={0}
                        max={20}
                        value={row.internal}
                        onChange={(e) => updateMark(row.id, "internal", Number(e.target.value) || 0)}
                        className="min-h-10 w-20 rounded-md border border-line bg-surface px-2.5 text-sm text-ink"
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

