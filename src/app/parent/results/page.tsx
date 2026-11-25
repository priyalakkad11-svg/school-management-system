"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";

const RESULTS = [
  { subject: "Mathematics", score: "93 / 100", classAvg: "76.4", highest: "96", grade: "A+", feedback: "Strong problem solving" },
  { subject: "Science", score: "91 / 100", classAvg: "74.1", highest: "95", grade: "A+", feedback: "Great Physics practicals" },
  { subject: "English", score: "88 / 100", classAvg: "78.0", highest: "92", grade: "A", feedback: "Well structured essays" },
  { subject: "Computer Science", score: "97 / 100", classAvg: "82.5", highest: "98", grade: "A+", feedback: "Top project score" },
];

export default function ParentResultsPage() {
  const [child, setChild] = React.useState("Aarav Sharma (10–A)");
  const [term, setTerm] = React.useState("Term 1 Assessment 2026");

  return (
    <AppShell
      role="parent"
      title="Child Exam Results & Analytics"
      subtitle="Subject-wise marks compared with section averages and faculty feedback"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
          <Select
            label="Child"
            value={child}
            onChange={(e) => setChild(e.target.value)}
            options={[
              { label: "Aarav Sharma (10–A)", value: "Aarav Sharma (10–A)" },
              { label: "Diya Sharma (6–C)", value: "Diya Sharma (6–C)" },
            ]}
          />
          <Select
            label="Term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            options={[
              { label: "Term 1 Assessment 2026", value: "Term 1 Assessment 2026" },
              { label: "Unit Test 2 (Sep 2026)", value: "Unit Test 2 (Sep 2026)" },
            ]}
          />
        </div>
        <Button variant="primary" onClick={() => window.print()}>
          Download Report Card PDF
        </Button>
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            Subject-wise Marks &amp; Class Comparison — {child}
          </h2>
          <span className="text-xs text-ink-muted">{RESULTS.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Subject-wise exam marks">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Subject</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Obtained</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Class Avg</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Highest</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Grade</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Teacher Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {RESULTS.map((r) => (
                <tr key={r.subject} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{r.subject}</td>
                  <td className="py-3.5 px-4 text-sm font-medium text-ink">{r.score}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.classAvg}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.highest}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone="success">{r.grade}</StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
