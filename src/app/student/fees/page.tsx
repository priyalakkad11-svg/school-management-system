"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatCard, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const INSTALLMENTS = [
  { id: "f1", title: "Term 1 Tuition & Admission", due: "10 Apr 2026", amount: "₹22,000", mode: "NetBanking", status: "Paid", receipt: "RCP-2026-1021" },
  { id: "f2", title: "Term 2 Tuition & Lab", due: "10 Aug 2026", amount: "₹18,500", mode: "UPI (GPay)", status: "Paid", receipt: "RCP-2026-4410" },
  { id: "f3", title: "Annual Transport (Q1–Q2)", due: "15 Sep 2026", amount: "₹15,000", mode: "Card", status: "Paid", receipt: "RCP-2026-5012" },
  { id: "f4", title: "Term 3 Tuition Fee", due: "10 Jan 2027", amount: "₹18,500", mode: "—", status: "Due Soon", receipt: "Pay Online Now" },
];

export default function StudentFeesPage() {
  const { showToast } = useToast();
  const [paidTerm3, setPaidTerm3] = React.useState(false);

  const handlePayNow = () => {
    setPaidTerm3(true);
    showToast("Payment of ₹18,500 completed! Receipt RCP-2027-5501 generated.");
  };

  return (
    <AppShell
      role="student"
      title="Fees Due & Online Payment"
      subtitle="Annual tuition breakdown, scholarship credit, and downloadable fee receipts"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Annual Fee" value="₹74,000" delta="AY 2026–27 Tuition + Lab" />
        <StatCard
          title="Paid to Date"
          value={paidTerm3 ? "₹74,000" : "₹55,500"}
          delta={paidTerm3 ? "All 4 installments cleared" : "3 installments cleared"}
        />
        <StatCard
          title="Current Balance Due"
          value={paidTerm3 ? "₹0" : "₹18,500"}
          delta={paidTerm3 ? "No pending dues" : "Term 3 due Jan 10 2027"}
          deltaTone={paidTerm3 ? "success" : "warning"}
        />
        <StatCard title="Scholarship" value="10% Merit" delta="-₹7,400 applied" />
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Fee Schedule &amp; Payment History</h2>
          <span className="text-xs text-ink-muted">{INSTALLMENTS.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Fee schedule table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Installment</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Due Date</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Amount</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Payment Mode</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {INSTALLMENTS.map((row) => {
                const isDueRow = row.id === "f4" && !paidTerm3;
                const displayStatus = row.id === "f4" && paidTerm3 ? "Paid" : row.status;
                return (
                  <tr key={row.id} className="hover:bg-subtle/60">
                    <td className="py-3.5 px-4 text-sm font-semibold text-ink">{row.title}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.due}</td>
                    <td className="py-3.5 px-4 text-sm font-medium text-ink">{row.amount}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">
                      {row.id === "f4" && paidTerm3 ? "UPI (Instant)" : row.mode}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge tone={displayStatus === "Paid" ? "success" : "warning"}>
                        {displayStatus}
                      </StatusBadge>
                    </td>
                    <td className="py-3.5 px-4 text-sm font-medium text-brand">
                      {isDueRow ? (
                        <button
                          type="button"
                          onClick={handlePayNow}
                          className="font-semibold text-brand hover:underline cursor-pointer"
                        >
                          Pay Online Now
                        </button>
                      ) : row.id === "f4" ? (
                        "RCP-2027-5501"
                      ) : (
                        row.receipt
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {!paidTerm3 ? (
        <div>
          <Button variant="primary" size="lg" onClick={handlePayNow}>
            Pay ₹18,500 Online (UPI / Card / NetBanking)
          </Button>
        </div>
      ) : null}
    </AppShell>
  );
}

