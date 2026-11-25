"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const INITIAL_PROMO = [
  { id: "pr-1", roll: "01", name: "Aarav Sharma", finalResult: "91.6% (Pass)", att: "96.5%", decision: "Promote to 10–A", tone: "success" as const },
  { id: "pr-2", roll: "02", name: "Ananya Verma", finalResult: "94.2% (Pass)", att: "98.0%", decision: "Promote to 10–A", tone: "success" as const },
  { id: "pr-3", roll: "03", name: "Kabir Joshi", finalResult: "38.0% (Compartment)", att: "81.0%", decision: "Hold / Repeat", tone: "warning" as const },
  { id: "pr-4", roll: "04", name: "Rohan Mehta", finalResult: "82.4% (Pass)", att: "93.0%", decision: "Transfer Out (TC)", tone: "info" as const },
];

export default function StudentPromotionPage() {
  const { showToast } = useToast();
  const [fromCls, setFromCls] = React.useState("AY 2025–26 • Class 9–A");
  const [toCls, setToCls] = React.useState("AY 2026–27 • Class 10–A");

  return (
    <AppShell
      role="admin"
      title="Student Promotion & Transfer"
      subtitle="Promote eligible learners to the next academic session or issue Transfer Certificates"
    >
      <Card className="p-5 flex flex-wrap items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
          <Select
            label="From Session & Class"
            value={fromCls}
            onChange={(e) => setFromCls(e.target.value)}
            options={[{ label: "AY 2025–26 • Class 9–A", value: "AY 2025–26 • Class 9–A" }]}
          />
          <Select
            label="Promote To"
            value={toCls}
            onChange={(e) => setToCls(e.target.value)}
            options={[{ label: "AY 2026–27 • Class 10–A", value: "AY 2026–27 • Class 10–A" }]}
          />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="secondary"
            onClick={() => showToast("Auto-selected 37 passing students (>= 40% & >= 75% attendance).")}
          >
            Auto-Select Passed Students
          </Button>
          <Button
            variant="primary"
            onClick={() => showToast(`Promoted 37 students from ${fromCls} to ${toCls}.`)}
          >
            Promote Selected (37)
          </Button>
        </div>
      </Card>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Promotion Eligibility List — Class 9–A</h2>
          <span className="text-xs text-ink-muted">{INITIAL_PROMO.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Promotion eligibility table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Roll</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Student Name</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Final Result</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Attendance</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Action Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {INITIAL_PROMO.map((row) => (
                <tr key={row.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{row.roll}</td>
                  <td className="py-3.5 px-4 text-sm font-medium text-ink">{row.name}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.finalResult}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.att}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={row.tone}>{row.decision}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

