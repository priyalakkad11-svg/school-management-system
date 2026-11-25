"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const INSTALLMENTS = [
  { id: "pf-1", child: "Aarav (10–A)", head: "Term 3 Tuition", due: "10 Jan 2027", amount: "₹18,500", status: "Due" },
  { id: "pf-2", child: "Diya (6–C)", head: "Term 3 Tuition", due: "10 Jan 2027", amount: "₹14,200", status: "Due" },
  { id: "pf-3", child: "Aarav (10–A)", head: "Term 2 Tuition", due: "10 Aug 2026", amount: "₹18,500", status: "Paid" },
  { id: "pf-4", child: "Diya (6–C)", head: "Term 2 Tuition", due: "10 Aug 2026", amount: "₹14,200", status: "Paid" },
];

export default function ParentFeesPage() {
  const { showToast } = useToast();
  const [paidAll, setPaidAll] = React.useState(false);
  const [method, setMethod] = React.useState("UPI (GPay / PhonePe / Paytm)");
  const [upiId, setUpiId] = React.useState("rajesh.sharma@okhdfcbank");

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setPaidAll(true);
    showToast("Payment of ₹32,700 successful! Receipts RCP-2027-8810 & 8811 issued.");
  };

  return (
    <AppShell
      role="parent"
      title="School Fees & Online Payment"
      subtitle="Consolidated fee installments for Aarav (10–A) & Diya (6–C)"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-8 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">
              Pending &amp; Paid Installments (All Children)
            </h2>
            <span className="text-xs text-ink-muted">{INSTALLMENTS.length} entries</span>
          </div>

          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Family fee ledger">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle border-b border-line">
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Child</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Fee Head</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Due Date</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Amount</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {INSTALLMENTS.map((row) => {
                  const status = paidAll ? "Paid" : row.status;
                  return (
                    <tr key={row.id} className="hover:bg-subtle/60">
                      <td className="py-3 px-3 text-sm font-semibold text-ink">{row.child}</td>
                      <td className="py-3 px-3 text-sm text-ink-secondary">{row.head}</td>
                      <td className="py-3 px-3 text-sm text-ink-secondary">{row.due}</td>
                      <td className="py-3 px-3 text-sm font-medium text-ink">{row.amount}</td>
                      <td className="py-3 px-3">
                        <StatusBadge tone={status === "Paid" ? "success" : "warning"}>
                          {status}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6">
          <form onSubmit={handleCheckout} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink">Checkout — Online Fee Payment</h2>
            <p className="text-xs text-ink-secondary">Selected: Aarav + Diya Term 3 Tuition</p>
            <div className="text-2xl font-bold text-brand">
              {paidAll ? "Total Payable: ₹0" : "Total Payable: ₹32,700"}
            </div>
            <Select
              label="Payment Method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              options={[
                { label: "UPI (GPay / PhonePe / Paytm)", value: "UPI (GPay / PhonePe / Paytm)" },
                { label: "Credit / Debit Card", value: "Card" },
                { label: "NetBanking", value: "NetBanking" },
              ]}
            />
            <Input
              label="UPI ID / Card"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={paidAll}
              className="w-full"
            >
              {paidAll ? "All Dues Cleared" : "Pay ₹32,700 Securely"}
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

