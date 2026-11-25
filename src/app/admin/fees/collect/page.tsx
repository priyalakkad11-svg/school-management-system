"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { MOCK_FEE_TRANSACTIONS } from "@/mocks/school.data";
import { formatInr } from "@/lib/utils";

export default function FeeCollectionPage() {
  const { showToast } = useToast();
  const [studentId, setStudentId] = React.useState("ADM-2026-0144 (Devansh Patel • ₹19,000 Due)");
  const [mode, setMode] = React.useState("UPI (GPay / Razorpay)");
  const [amount, setAmount] = React.useState("19000");
  const [reference, setReference] = React.useState("UTR-4099812711");

  const handleCollect = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Collected ${formatInr(Number(amount) || 0)} via ${mode}. Receipt issued.`);
  };

  return (
    <AppShell
      role="admin"
      title="Fee Counter & Online Collection"
      subtitle="Accept counter cash/cheque/UPI payments and generate GST-compliant school receipts"
      actions={
        <Link href="/admin/fees/receipt">
          <Button variant="outline">Print Sample Receipt</Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-5 p-6">
          <form onSubmit={handleCollect} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink">Record Fee Payment</h2>
            <Select
              label="Select Student Invoice"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              options={[
                { label: "ADM-2026-0144 (Devansh Patel • ₹19,000 Due)", value: "ADM-2026-0144 (Devansh Patel • ₹19,000 Due)" },
                { label: "ADM-2026-0146 (Kabir Joshi • ₹22,700 Due)", value: "ADM-2026-0146 (Kabir Joshi • ₹22,700 Due)" },
              ]}
            />
            <Select
              label="Payment Mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              options={[
                { label: "UPI (GPay / Razorpay)", value: "UPI (GPay / Razorpay)" },
                { label: "NetBanking / NEFT", value: "NetBanking / NEFT" },
                { label: "Card / POS Counter", value: "Card / POS Counter" },
                { label: "Cash Counter", value: "Cash Counter" },
              ]}
            />
            <Input label="Net Payable (INR)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input label="Transaction / Cheque Ref" value={reference} onChange={(e) => setReference(e.target.value)} />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Confirm &amp; Generate Receipt
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-7 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Recent Fee Counter Receipts</h2>
            <span className="text-xs text-ink-muted">{MOCK_FEE_TRANSACTIONS.length} entries</span>
          </div>
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Recent fee receipts">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle border-b border-line">
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Receipt No</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Student</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Amount</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Mode</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {MOCK_FEE_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-3 px-3 text-sm font-bold text-brand">
                      <Link href="/admin/fees/receipt" className="hover:underline">
                        {tx.receiptNo}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-sm text-ink">{tx.studentName}</td>
                    <td className="py-3 px-3 text-sm font-medium text-ink">{formatInr(tx.netPaid || tx.amount)}</td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{tx.mode}</td>
                    <td className="py-3 px-3">
                      <StatusBadge
                        tone={tx.status === "Paid" ? "success" : tx.status === "Due" ? "warning" : "danger"}
                      >
                        {tx.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

