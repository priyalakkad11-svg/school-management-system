"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { getLiveFeeTransactionsAction, getLiveStudentsAction } from "@/app/actions/live-data.actions";
import { collectStudentFeeAction } from "@/app/actions/academics-finance.actions";
import { formatInr } from "@/lib/utils";
import type { FeeTransaction, Student } from "@/types/domain";

export default function FeeCollectionPage() {
  const { showToast } = useToast();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [txns, setTxns] = React.useState<FeeTransaction[]>([]);
  const [studentId, setStudentId] = React.useState("");
  const [mode, setMode] = React.useState<"Cash" | "UPI" | "Bank Transfer" | "Cheque" | "Card">("UPI");
  const [amount, setAmount] = React.useState("18500");
  const [reference, setReference] = React.useState("UTR-4099812711");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    void Promise.all([getLiveStudentsAction(), getLiveFeeTransactionsAction()]).then(([stu, fees]) => {
      if (!active) return;
      setStudents(stu);
      setTxns(fees);
      const defaulter = stu.find((s) => s.feeDueAmount > 0) ?? stu[0];
      if (defaulter) {
        setStudentId(defaulter.id);
        setAmount(String(defaulter.feeDueAmount > 0 ? defaulter.feeDueAmount : 18500));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      showToast("Select a student first.", "warning");
      return;
    }
    setBusy(true);
    try {
      const res = await collectStudentFeeAction({
        studentId,
        amountInr: Number(amount) || 0,
        paymentMode: mode,
        referenceNo: reference,
      });
      if (!res.ok || !res.data) {
        showToast(res.error ?? "Fee collection failed.", "warning");
        return;
      }
      showToast(`Collected ${formatInr(Number(amount) || 0)} — Receipt ${res.data.receiptNumber} issued.`);
      const [freshStu, freshFees] = await Promise.all([
        getLiveStudentsAction(),
        getLiveFeeTransactionsAction(),
      ]);
      setStudents(freshStu);
      setTxns(freshFees);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Fee Counter & Online Collection"
      subtitle="Accept counter cash/cheque/UPI payments and generate gapless GST-compliant school receipts"
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
              label="Select Student"
              value={studentId}
              onChange={(e) => {
                const id = e.target.value;
                setStudentId(id);
                const match = students.find((s) => s.id === id);
                if (match && match.feeDueAmount > 0) setAmount(String(match.feeDueAmount));
              }}
              options={students.map((s) => ({
                label: `${s.admissionId} (${s.name} • ₹${s.feeDueAmount} Due)`,
                value: s.id,
              }))}
            />
            <Select
              label="Payment Mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
              options={[
                { label: "UPI (GPay / Razorpay)", value: "UPI" },
                { label: "Bank Transfer (NEFT)", value: "Bank Transfer" },
                { label: "Card / POS Counter", value: "Card" },
                { label: "Cash Counter", value: "Cash" },
                { label: "Cheque", value: "Cheque" },
              ]}
            />
            <Input label="Net Payable (INR)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input label="Transaction / Cheque Ref" value={reference} onChange={(e) => setReference(e.target.value)} />
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
              {busy ? "Issuing Receipt..." : "Confirm & Generate Receipt"}
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-7 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Recent Fee Counter Receipts</h2>
            <span className="text-xs text-ink-muted">{txns.length} entries</span>
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
                {txns.map((tx) => (
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

