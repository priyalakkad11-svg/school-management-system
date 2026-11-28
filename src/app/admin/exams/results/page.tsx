"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { listExamsAndScalesAction, togglePublishExamAction } from "@/app/actions/academics-finance.actions";

const CLASS_RESULTS = [
  { id: "cr-1", cls: "Class 10–A", entered: "40 / 40", passPct: "97.5%", topScore: "96.4% (Ananya V.)", status: "Published" },
  { id: "cr-2", cls: "Class 10–B", entered: "38 / 38", passPct: "94.7%", topScore: "93.1% (Ishita R.)", status: "Ready to Publish" },
  { id: "cr-3", cls: "Class 9–B", entered: "36 / 36", passPct: "91.6%", topScore: "91.8% (Rohan M.)", status: "Ready to Publish" },
];

export default function ResultGenerationPage() {
  const { showToast } = useToast();
  const [rows, setRows] = React.useState(CLASS_RESULTS);

  const publishAll = async () => {
    const exRes = await listExamsAndScalesAction();
    const examId = exRes.ok ? exRes.data.exams[0]?.id : undefined;
    if (examId) {
      const r = await togglePublishExamAction({ examId, publish: true });
      if (!r.ok) {
        showToast(r.error ?? "Failed publishing results.", "warning");
        return;
      }
    }
    setRows((prev) => prev.map((r) => ({ ...r, status: "Published" })));
    showToast("Term Report Cards published to all Student & Parent portals.");
  };

  return (
    <AppShell
      role="admin"
      title="Result Processing & Publication"
      subtitle="Verify marks lock completion and publish digital report cards"
      actions={
        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/exams/report-card">
            <Button variant="outline">Preview Sample Report Card</Button>
          </Link>
          <Button variant="primary" onClick={publishAll}>
            Publish Results to Portals
          </Button>
        </div>
      }
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Result processing queue">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Section</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Marks Verified</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Pass Rate</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Section Topper</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-bold text-ink">{r.cls}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.entered}</td>
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{r.passPct}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.topScore}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={r.status === "Published" ? "success" : "info"}>
                      {r.status}
                    </StatusBadge>
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

