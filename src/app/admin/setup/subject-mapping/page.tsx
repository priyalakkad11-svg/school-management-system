"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const INITIAL_MAPPING = [
  { id: "m1", subject: "Mathematics", code: "MATH-041", periods: "6 Periods", type: "Theory", mandatory: "Yes", mapped: true },
  { id: "m2", subject: "Science (Phy/Chem/Bio)", code: "SCI-086", periods: "7 Periods", type: "Theory + Lab", mandatory: "Yes", mapped: true },
  { id: "m3", subject: "English Lang & Lit", code: "ENG-184", periods: "5 Periods", type: "Theory", mandatory: "Yes", mapped: true },
  { id: "m4", subject: "Computer Applications", code: "CA-165", periods: "4 Periods", type: "Lab Elective", mandatory: "Optional", mapped: true },
  { id: "m5", subject: "French / Sanskrit", code: "LANG-018", periods: "3 Periods", type: "2nd Language", mandatory: "Choice", mapped: true },
];

export default function SubjectClassMappingPage() {
  const { showToast } = useToast();
  const [cls, setCls] = React.useState("Class 10 (All Sections)");
  const [year, setYear] = React.useState("AY 2026–27");
  const [rows, setRows] = React.useState(INITIAL_MAPPING);

  const toggleMapped = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, mapped: !r.mapped } : r)));
  };

  return (
    <AppShell
      role="admin"
      title="Subject-to-Class Curriculum Mapping"
      subtitle="Assign mandatory and elective subjects to each grade for weekly timetable & exam scheduling"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
          <Select
            label="Select Class"
            value={cls}
            onChange={(e) => setCls(e.target.value)}
            options={[
              { label: "Class 10 (All Sections)", value: "Class 10 (All Sections)" },
              { label: "Class 9 (All Sections)", value: "Class 9 (All Sections)" },
              { label: "Class 12 (Science)", value: "Class 12 (Science)" },
            ]}
          />
          <Select
            label="Academic Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            options={[
              { label: "AY 2026–27", value: "AY 2026–27" },
              { label: "AY 2027–28 (Draft)", value: "AY 2027–28 (Draft)" },
            ]}
          />
        </div>
        <Button
          variant="primary"
          onClick={() => showToast(`Saved subject mapping for ${cls} (${year}).`)}
        >
          Save Subject Mapping
        </Button>
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Mapped Subjects for {cls}</h2>
          <span className="text-xs text-ink-muted">{rows.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Subject class mapping table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Subject</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Code</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Periods / Week</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Type</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Mandatory</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Mapped</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{r.subject}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.code}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.periods}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.type}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.mandatory}</td>
                  <td className="py-3.5 px-4">
                    <button type="button" onClick={() => toggleMapped(r.id)} className="cursor-pointer rounded-full">
                      <StatusBadge tone={r.mapped ? (r.mandatory === "Yes" ? "success" : "info") : "neutral"}>
                        {r.mapped ? "✓ Mapped" : "Unmapped"}
                      </StatusBadge>
                    </button>
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

