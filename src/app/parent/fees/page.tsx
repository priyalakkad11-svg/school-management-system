"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { listPortalAcademicDataAction, payPortalFeeAction } from "@/app/actions/academics-finance.actions";

interface ParentFeeRow {
  id: string;
  studentId: string;
  child: string;
  head: string;
  due: string;
  amountInr: number;
  status: string;
}

export default function ParentFeesPage() {
  const { showToast } = useToast();
  const [rows, setRows] = React.useState<ParentFeeRow[]>([]);
  const [selectedStudentId, setSelectedStudentId] = React.useState("");
  const [payAmount, setPayAmount] = React.useState("18500");
  const [method, setMethod] = React.useState<"UPI" | "Card" | "NetBanking">("UPI");
  const [upiId, setUpiId] = React.useState("parent@okhdfcbank");
  const [paying, setPaying] = React.useState(false);

  const loadLedger = React.useCallback(async () => {
    const res = await listPortalAcademicDataAction();
    if (!res.ok || !res.data) return;
    const dueRows: ParentFeeRow[] = res.data.students
      .filter((s) => Number(s.fee_balance_inr ?? 0) > 0)
      .slice(0, 6)
      .map((s) => ({
        id: `due-${s.id}`,
        studentId: s.id,
        child: `${s.full_name} (${s.section_name})`,
        head: "Outstanding Tuition Balance",
        due: "Current Term",
        amountInr: Number(s.fee_balance_inr),
        status: "Due",
      }));
    const paidRows: ParentFeeRow[] = res.data.receipts.slice(0, 10).map((r) => {
      const stu = Array.isArray(r.students) ? r.students[0] : r.students;
      return {
        id: r.id,
        studentId: r.student_id,
        child: stu?.full_name ?? "Student",
        head: `Receipt ${r.receipt_number} (${r.payment_mode})`,
        due: new Date(r.paid_at).toLocaleDateString("en-IN"),
        amountInr: Number(r.amount_inr),
        status: "Paid",
      };
    });
    setRows([...dueRows, ...paidRows]);
    if (dueRows[0]) {
      setSelectedStudentId(dueRows[0].studentId);
      setPayAmount(String(dueRows[0].amountInr));
    } else if (res.data.students[0]) {
      setSelectedStudentId(res.data.students[0].id);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    void listPortalAcademicDataAction().then((res) => {
      if (!active || !res.ok || !res.data) return;
      const dueRows: ParentFeeRow[] = res.data.students
        .filter((s) => Number(s.fee_balance_inr ?? 0) > 0)
        .slice(0, 6)
        .map((s) => ({
          id: `due-${s.id}`,
          studentId: s.id,
          child: `${s.full_name} (${s.section_name})`,
          head: "Outstanding Tuition Balance",
          due: "Current Term",
          amountInr: Number(s.fee_balance_inr),
          status: "Due",
        }));
      const paidRows: ParentFeeRow[] = res.data.receipts.slice(0, 10).map((r) => {
        const stu = Array.isArray(r.students) ? r.students[0] : r.students;
        return {
          id: r.id,
          studentId: r.student_id,
          child: stu?.full_name ?? "Student",
          head: `Receipt ${r.receipt_number} (${r.payment_mode})`,
          due: new Date(r.paid_at).toLocaleDateString("en-IN"),
          amountInr: Number(r.amount_inr),
          status: "Paid",
        };
      });
      setRows([...dueRows, ...paidRows]);
      if (dueRows[0]) {
        setSelectedStudentId(dueRows[0].studentId);
        setPayAmount(String(dueRows[0].amountInr));
      } else if (res.data.students[0]) {
        setSelectedStudentId(res.data.students[0].id);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(payAmount) || 0;
    if (!selectedStudentId || amt <= 0) {
      showToast("Select a student and positive payment amount.", "warning");
      return;
    }
    setPaying(true);
    const res = await payPortalFeeAction({
      studentId: selectedStudentId,
      amountInr: amt,
      paymentMode: method,
      referenceNo: upiId,
    });
    setPaying(false);
    if (!res.ok || !res.data) {
      showToast(res.error ?? "Payment failed.", "warning");
      return;
    }
    showToast(`Payment of ₹${amt.toLocaleString("en-IN")} successful! Receipt ${res.data.receiptNumber} issued.`, "success");
    await loadLedger();
  };

  const totalDue = rows.filter((r) => r.status === "Due").reduce((s, r) => s + r.amountInr, 0);

  return (
    <AppShell
      role="parent"
      title="School Fees & Online Payment"
      subtitle="Live fee dues and gapless fee receipts for linked wards"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-8 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">
              Pending Dues &amp; Paid Receipts
            </h2>
            <span className="text-xs text-ink-muted">{rows.length} entries</span>
          </div>

          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Family fee ledger">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle border-b border-line">
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Child</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Fee Head / Receipt</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Date / Term</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Amount</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-subtle/60">
                    <td className="py-3 px-3 text-sm font-semibold text-ink">{row.child}</td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{row.head}</td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{row.due}</td>
                    <td className="py-3 px-3 text-sm font-medium text-ink">
                      ₹{row.amountInr.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge tone={row.status === "Paid" ? "success" : "warning"}>
                        {row.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6">
          <form onSubmit={handleCheckout} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink">Checkout — Online Fee Payment</h2>
            <div className="text-2xl font-bold text-brand">
              Total Outstanding: ₹{totalDue.toLocaleString("en-IN")}
            </div>
            <Input
              label="Amount to Pay (₹)"
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
            <Select
              label="Payment Method"
              value={method}
              onChange={(e) => setMethod(e.target.value as "UPI" | "Card" | "NetBanking")}
              options={[
                { label: "UPI (GPay / PhonePe / Paytm)", value: "UPI" },
                { label: "Credit / Debit Card", value: "Card" },
                { label: "NetBanking", value: "NetBanking" },
              ]}
            />
            <Input
              label="UPI ID / Reference"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={paying || !selectedStudentId}
              className="w-full"
            >
              {paying ? "Processing..." : `Pay ₹${(Number(payAmount) || 0).toLocaleString("en-IN")} Securely`}
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

