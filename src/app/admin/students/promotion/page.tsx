"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Checkbox, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  executeAcademicYearRolloverAction,
  getRolloverContextAction,
  type RolloverCandidateDto,
} from "@/app/actions/onboarding.actions";
import { formatInr } from "@/lib/saas-pricing";

export default function StudentPromotionPage() {
  const { showToast } = useToast();
  const [years, setYears] = React.useState<Array<{ id: string; name: string; status: string }>>([]);
  const [classes, setClasses] = React.useState<Array<{ id: string; name: string }>>([]);
  const [students, setStudents] = React.useState<RolloverCandidateDto[]>([]);
  const [decisions, setDecisions] = React.useState<Record<string, "Promote" | "Detain" | "Transfer">>({});
  const [fromYearId, setFromYearId] = React.useState("");
  const [toYearId, setToYearId] = React.useState("");
  const [targetClassId, setTargetClassId] = React.useState("");
  const [archiveSource, setArchiveSource] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    void getRolloverContextAction().then((res) => {
      if (!active || !res.ok || !res.data) return;
      setYears(res.data.years);
      setClasses(res.data.classes);
      setStudents(res.data.students);
      const map: Record<string, "Promote" | "Detain" | "Transfer"> = {};
      for (const s of res.data.students) map[s.studentId] = s.defaultAction;
      setDecisions(map);
      if (res.data.years[0]) {
        setFromYearId(res.data.years[0].id);
        setToYearId(res.data.years[1]?.id ?? res.data.years[0].id);
      }
      if (res.data.classes[0]) setTargetClassId(res.data.classes[0].id);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleRollover = async () => {
    if (!fromYearId || !toYearId || !targetClassId || students.length === 0) {
      showToast("Select source/target academic years and target class.", "warning");
      return;
    }
    setSaving(true);
    try {
      const res = await executeAcademicYearRolloverAction({
        fromAcademicYearId: fromYearId,
        toAcademicYearId: toYearId,
        targetClassId,
        targetSection: "A",
        archiveSourceYear: archiveSource,
        decisions: students.map((s) => ({
          studentId: s.studentId,
          action: decisions[s.studentId] ?? "Promote",
          currentClassId: s.currentClassId,
          feeBalanceInr: s.feeBalanceInr,
        })),
      });
      if (!res.ok || !res.data) {
        showToast(res.error ?? "Rollover failed.", "warning");
        return;
      }
      showToast(`Processed ${res.data.processed} student rollover decisions with fee balance carry-forward.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Student Promotion & Transfer"
      subtitle="Promote eligible learners to the next academic session, carry forward fee dues, or archive past sessions"
    >
      <Card className="p-5 flex flex-wrap items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:flex-1">
          <Select
            label="From Session"
            value={fromYearId}
            onChange={(e) => setFromYearId(e.target.value)}
            options={years.map((y) => ({ label: `${y.name} (${y.status})`, value: y.id }))}
          />
          <Select
            label="To Session"
            value={toYearId}
            onChange={(e) => setToYearId(e.target.value)}
            options={years.map((y) => ({ label: `${y.name} (${y.status})`, value: y.id }))}
          />
          <Select
            label="Target Promoted Class"
            value={targetClassId}
            onChange={(e) => setTargetClassId(e.target.value)}
            options={classes.map((c) => ({ label: c.name, value: c.id }))}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Checkbox label="Archive source session read-only" checked={archiveSource} onChange={setArchiveSource} />
          <Button variant="primary" disabled={saving} onClick={() => void handleRollover()}>
            {saving ? "Rolling Over..." : `Execute Rollover (${students.length})`}
          </Button>
        </div>
      </Card>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Promotion Eligibility &amp; Fee Carry-Forward</h2>
          <span className="text-xs text-ink-muted">{students.length} active learners</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Promotion eligibility table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Adm / Roll</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Student Name</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Current Class</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Fee Carry-Forward</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Action Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {students.map((row) => {
                const act = decisions[row.studentId] ?? "Promote";
                return (
                  <tr key={row.studentId} className="hover:bg-subtle/60">
                    <td className="py-3.5 px-4 text-xs font-mono text-ink">
                      {row.admissionNo} (#{row.rollNo || "—"})
                    </td>
                    <td className="py-3.5 px-4 text-sm font-medium text-ink">{row.fullName}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">
                      {row.currentClassName} – {row.currentSection}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-medium text-ink">
                      {formatInr(row.feeBalanceInr)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          tone={act === "Promote" ? "success" : act === "Detain" ? "warning" : "info"}
                        >
                          {act}
                        </StatusBadge>
                        <select
                          aria-label={`Decision for ${row.fullName}`}
                          value={act}
                          onChange={(e) =>
                            setDecisions((prev) => ({
                              ...prev,
                              [row.studentId]: e.target.value as "Promote" | "Detain" | "Transfer",
                            }))
                          }
                          className="rounded border border-line bg-surface px-2 py-1 text-xs text-ink"
                        >
                          <option value="Promote">Promote</option>
                          <option value="Detain">Hold / Detain</option>
                          <option value="Transfer">Transfer Out (TC)</option>
                        </select>
                      </div>
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
