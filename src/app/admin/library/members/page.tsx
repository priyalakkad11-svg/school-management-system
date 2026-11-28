"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { listP1OperationsDataAction, settleLibraryFineAction } from "@/app/actions/academics-finance.actions";
import { getLiveStudentsAction } from "@/app/actions/live-data.actions";

interface LibraryMemberRow {
  id: string;
  issueId?: string;
  card: string;
  name: string;
  issued: string;
  overdueFineInr: number;
  status: string;
}

export default function LibraryMembersFinesPage() {
  const { showToast } = useToast();
  const [members, setMembers] = React.useState<LibraryMemberRow[]>([]);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    const [ops, students] = await Promise.all([listP1OperationsDataAction(), getLiveStudentsAction()]);
    const issues = ops.ok && ops.data ? ops.data.issues : [];
    const mapped: LibraryMemberRow[] = students.slice(0, 20).map((s) => {
      const stuIssues = issues.filter(
        (i) => (i.member_id === s.id || i.member_name.includes(s.name)) && i.status !== "Returned",
      );
      const totalFine = stuIssues.reduce((sum, i) => sum + Number(i.fine_inr ?? 0), 0);
      return {
        id: s.id,
        issueId: stuIssues[0]?.id,
        card: `LIB-${s.admissionId}`,
        name: `${s.name} (${s.className}–${s.section})`,
        issued: `${stuIssues.length} / 3`,
        overdueFineInr: totalFine,
        status: s.status,
      };
    });
    setMembers(mapped);
  }, []);

  React.useEffect(() => {
    let active = true;
    void Promise.all([listP1OperationsDataAction(), getLiveStudentsAction()]).then(([ops, students]) => {
      if (!active) return;
      const issues = ops.ok && ops.data ? ops.data.issues : [];
      setMembers(
        students.slice(0, 20).map((s) => {
          const stuIssues = issues.filter(
            (i) => (i.member_id === s.id || i.member_name.includes(s.name)) && i.status !== "Returned",
          );
          const totalFine = stuIssues.reduce((sum, i) => sum + Number(i.fine_inr ?? 0), 0);
          return {
            id: s.id,
            issueId: stuIssues[0]?.id,
            card: `LIB-${s.admissionId}`,
            name: `${s.name} (${s.className}–${s.section})`,
            issued: `${stuIssues.length} / 3`,
            overdueFineInr: totalFine,
            status: s.status,
          };
        }),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell
      role="admin"
      title="Library Members & Overdue Fines"
      subtitle="Active student & faculty borrowing quotas and late-return fine ledger"
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Library members table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Card ID</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Member Name</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Books Issued</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Fine Due</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="py-3.5 px-4 text-sm font-bold text-ink">{m.card}</td>
                  <td className="py-3.5 px-4 text-sm text-ink">{m.name}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{m.issued}</td>
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">₹{m.overdueFineInr}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={m.overdueFineInr === 0 ? "success" : "warning"}>
                      {m.status}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!m.issueId || busyId === m.id}
                      onClick={async () => {
                        if (!m.issueId) return;
                        setBusyId(m.id);
                        const res = await settleLibraryFineAction({ issueId: m.issueId, action: "collect" });
                        setBusyId(null);
                        if (!res.ok) {
                          showToast(res.error ?? "Failed to settle library account.", "warning");
                          return;
                        }
                        showToast(`Settled library account for ${m.name}.`, "success");
                        await loadData();
                      }}
                    >
                      {m.issueId ? "Collect / Waive" : "No Dues"}
                    </Button>
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

