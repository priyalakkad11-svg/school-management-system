"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatCard, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { listPortalAcademicDataAction, payPortalFeeAction } from "@/app/actions/academics-finance.actions";

interface FeeRow {
  id: string;
  title: string;
  date: string;
  amountInr: number;
  mode: string;
  status: "Paid" | "Due Soon";
  receipt: string;
}

export default function StudentFeesPage() {
  const { showToast } = useToast();
  const [studentId, setStudentId] = React.useState("");
  const [balanceDue, setBalanceDue] = React.useState(0);
  const [rows, setRows] = React.useState<FeeRow[]>([]);
  const [paying, setPaying] = React.useState(false);

  const loadData = React.useCallback(async () => {
    const res = await listPortalAcademicDataAction();
    if (!res.ok || !res.data) return;
    const stu = res.data.students[0];
    if (stu) {
      setStudentId(stu.id);
      setBalanceDue(Number(stu.fee_balance_inr ?? 0));
    }
    const receipts: FeeRow[] = res.data.receipts.map((r) => ({
      id: r.id,
      title: `Fee Receipt ${r.receipt_number}`,
      date: new Date(r.paid_at).toLocaleDateString("en-IN"),
      amountInr: Number(r.amount_inr),
      mode: r.payment_mode,
      status: "Paid",
      receipt: r.receipt_number,
    }));
    if (stu && Number(stu.fee_balance_inr ?? 0) > 0) {
      receipts.unshift({
        id: "current-due",
        title: "Current Term Tuition Balance",
        date: "Current Term",
        amountInr: Number(stu.fee_balance_inr),
        mode: "—",
        status: "Due Soon",
        receipt: "Pay Online Now",
      });
    }
    setRows(receipts);
  }, []);

  React.useEffect(() => {
    let active = true;
    void listPortalAcademicDataAction().then((res) => {
      if (!active || !res.ok || !res.data) return;
      const stu = res.data.students[0];
      if (stu) {
        setStudentId(stu.id);
        setBalanceDue(Number(stu.fee_balance_inr ?? 0));
      }
      const receipts: FeeRow[] = res.data.receipts.map((r) => ({
        id: r.id,
        title: `Fee Receipt ${r.receipt_number}`,
        date: new Date(r.paid_at).toLocaleDateString("en-IN"),
        amountInr: Number(r.amount_inr),
        mode: r.payment_mode,
        status: "Paid",
        receipt: r.receipt_number,
      }));
      if (stu && Number(stu.fee_balance_inr ?? 0) > 0) {
        receipts.unshift({
          id: "current-due",
          title: "Current Term Tuition Balance",
          date: "Current Term",
          amountInr: Number(stu.fee_balance_inr),
          mode: "—",
          status: "Due Soon",
          receipt: "Pay Online Now",
        });
      }
      setRows(receipts);
    });
    return () => {
      active = false;
    };
  }, []);

  const handlePayNow = async () => {
    if (!studentId || balanceDue <= 0) return;
    setPaying(true);
    const res = await payPortalFeeAction({
      studentId,
      amountInr: balanceDue,
      paymentMode: "UPI",
    });
    setPaying(false);
    if (!res.ok || !res.data) {
      showToast(res.error ?? "Payment failed.", "warning");
      return;
    }
    showToast(
      `Payment of ₹${balanceDue.toLocaleString("en-IN")} completed! Receipt ${res.data.receiptNumber} generated.`,
      "success",
    );
    await loadData();
  };

  const paidTotal = rows.filter((r) => r.status === "Paid").reduce((sum, r) => sum + r.amountInr, 0);

  return (
    <AppShell
      role="student"
      title="Fees Due & Online Payment"
      subtitle="Annual tuition breakdown, scholarship credit, and downloadable fee receipts"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Fee Billed" value={`₹${(paidTotal + balanceDue).toLocaleString("en-IN")}`} delta="Current Academic Year" />
        <StatCard
          title="Paid to Date"
          value={`₹${paidTotal.toLocaleString("en-IN")}`}
          delta={`${rows.filter((r) => r.status === "Paid").length} receipts issued`}
        />
        <StatCard
          title="Current Balance Due"
          value={`₹${balanceDue.toLocaleString("en-IN")}`}
          delta={balanceDue <= 0 ? "No pending dues" : "Due this term"}
          deltaTone={balanceDue <= 0 ? "success" : "warning"}
        />
        <StatCard title="Payment Gateway" value="UPI / Card" delta="Gapless FY Receipts" />
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Fee Schedule &amp; Payment History</h2>
          <span className="text-xs text-ink-muted">{rows.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Fee schedule table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Installment / Receipt</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Date</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Amount</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Payment Mode</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{row.title}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.date}</td>
                  <td className="py-3.5 px-4 text-sm font-medium text-ink">₹{row.amountInr.toLocaleString("en-IN")}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{row.mode}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={row.status === "Paid" ? "success" : "warning"}>
                      {row.status}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 px-4 text-sm font-medium text-brand">
                    {row.status === "Due Soon" ? (
                      <button
                        type="button"
                        disabled={paying}
                        onClick={() => void handlePayNow()}
                        className="font-semibold text-brand hover:underline cursor-pointer"
                      >
                        {paying ? "Paying..." : "Pay Online Now"}
                      </button>
                    ) : (
                      row.receipt
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {balanceDue > 0 ? (
        <div>
          <Button variant="primary" size="lg" disabled={paying} onClick={() => void handlePayNow()}>
            {paying ? "Processing..." : `Pay ₹${balanceDue.toLocaleString("en-IN")} Online (UPI / Card / NetBanking)`}
          </Button>
        </div>
      ) : null}
    </AppShell>
  );
}

