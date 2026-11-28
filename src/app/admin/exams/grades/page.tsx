"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { saveGradeScaleBandAction } from "@/app/actions/academics-finance.actions";

const GRADE_BANDS = [
  { grade: "A+", range: "91% – 100%", gp: "10.0", remark: "Distinction / Exemplary", tone: "success" as const },
  { grade: "A", range: "81% – 90%", gp: "9.0", remark: "Merit / Very Good", tone: "success" as const },
  { grade: "B+", range: "71% – 80%", gp: "8.0", remark: "Above Average", tone: "info" as const },
  { grade: "B", range: "61% – 70%", gp: "7.0", remark: "Proficient", tone: "info" as const },
  { grade: "C", range: "41% – 60%", gp: "5.5", remark: "Needs Practice", tone: "warning" as const },
  { grade: "E", range: "Below 33%", gp: "0.0", remark: "Compartment / Retest", tone: "danger" as const },
];

export default function GradeSystemSettingsPage() {
  const { showToast } = useToast();

  return (
    <AppShell
      role="admin"
      title="CBSE 9-Point Grade Scale Configuration"
      subtitle="Define percentage boundaries, GPA weights, and automatic transcript remarks"
      actions={
        <Button
          variant="primary"
          onClick={async () => {
            const res = await saveGradeScaleBandAction({
              grade: "A1",
              minPercent: 91,
              maxPercent: 100,
              gradePoint: 10,
              remark: "Distinction / Exemplary",
            });
            if (res.ok) showToast("Grading thresholds saved for AY 2026–27.");
            else showToast(res.error ?? "Unable to save grading rules.", "warning");
          }}
        >
          Save Grading Rules
        </Button>
      }
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Grading scale table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Grade</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Percentage Range</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Grade Point</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Transcript Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {GRADE_BANDS.map((band) => (
                <tr key={band.grade} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={band.tone}>{band.grade}</StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{band.range}</td>
                  <td className="py-3.5 px-4 text-sm text-ink">{band.gp}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{band.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

