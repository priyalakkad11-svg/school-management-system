"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  listSubscriptionsAndInvoicesAction,
  recordManualPaymentAction,
} from "@/app/actions/platform.actions";
import { createSaaSGatewayCheckoutStub } from "@/lib/payment-adapter";
import { formatInr } from "@/lib/saas-pricing";

type BillingData = Extract<
  Awaited<ReturnType<typeof listSubscriptionsAndInvoicesAction>>,
  { ok: true }
>["data"];

export default function PlatformInvoicesPage() {
  const { showToast } = useToast();
  const [data, setData] = React.useState<BillingData | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState<"UPI" | "Bank Transfer" | "Cash" | "Cheque">("UPI");
  const [referenceNo, setReferenceNo] = React.useState("");

  const load = React.useCallback(async () => {
    const res = await listSubscriptionsAndInvoicesAction();
    if (!res.ok) {
      showToast(res.error, "warning");
      return;
    }
    setData(res.data);
    const firstUnpaid = res.data.invoices.find((i) => i.status !== "paid") ?? res.data.invoices[0];
    if (firstUnpaid && !selectedInvoiceId) {
      setSelectedInvoiceId(firstUnpaid.id);
      setAmount(String(Math.max(0, Number(firstUnpaid.total_inr) - Number(firstUnpaid.amount_paid_inr))));
    }
  }, [selectedInvoiceId, showToast]);

  React.useEffect(() => {
    let active = true;
    void listSubscriptionsAndInvoicesAction().then((res) => {
      if (!active) return;
      if (!res.ok) {
        showToast(res.error, "warning");
        return;
      }
      setData(res.data);
      const firstUnpaid = res.data.invoices.find((i) => i.status !== "paid") ?? res.data.invoices[0];
      if (firstUnpaid) {
        setSelectedInvoiceId(firstUnpaid.id);
        setAmount(String(Math.max(0, Number(firstUnpaid.total_inr) - Number(firstUnpaid.amount_paid_inr))));
      }
    });
    return () => {
      active = false;
    };
  }, [showToast]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) return;
    const res = await recordManualPaymentAction({
      invoiceId: selectedInvoiceId,
      amountInr: Number(amount) || 0,
      method,
      referenceNo,
    });
    if (!res.ok) {
      showToast(res.error ?? "Failed recording payment.", "warning");
      return;
    }
    showToast("Payment recorded against GST invoice & school status synced.");
    setReferenceNo("");
    void load();
  };

  return (
    <AppShell
      role="super_admin"
      title="GST Invoices & Payments"
      subtitle="Gapless financial-year GST invoices, manual UPI/NEFT/Cash settlement & credit notes"
    >
      <Card className="p-5 flex flex-col gap-4">
        <h2 className="text-base font-bold text-ink">Record Manual Payment (UPI / Bank / Cash / Cheque)</h2>
        <form onSubmit={handleRecordPayment} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <Select
            label="Invoice"
            value={selectedInvoiceId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedInvoiceId(id);
              const inv = data?.invoices.find((x) => x.id === id);
              if (inv) setAmount(String(Math.max(0, Number(inv.total_inr) - Number(inv.amount_paid_inr))));
            }}
            options={(data?.invoices ?? []).map((inv) => ({
              label: `${inv.invoice_number} (${formatInr(Number(inv.total_inr))})`,
              value: inv.id,
            }))}
          />
          <Select
            label="Payment Method"
            value={method}
            onChange={(e) => setMethod(e.target.value as typeof method)}
            options={[
              { label: "UPI", value: "UPI" },
              { label: "Bank Transfer (NEFT/RTGS)", value: "Bank Transfer" },
              { label: "Cash", value: "Cash" },
              { label: "Cheque", value: "Cheque" },
            ]}
          />
          <Input
            label="Amount (INR)"
            type="number"
            min={1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            label="UTR / Reference No."
            required
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            placeholder="UTR4321908812"
          />
          <Button type="submit">Record Settlement</Button>
        </form>
      </Card>

      <Card className="p-5 overflow-x-auto">
        <h2 className="text-base font-bold text-ink mb-3">Issued GST Invoices</h2>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line text-ink-secondary">
              <th className="py-2 pr-3">Invoice #</th>
              <th className="py-2 pr-3">School</th>
              <th className="py-2 pr-3">Subtotal</th>
              <th className="py-2 pr-3">GST</th>
              <th className="py-2 pr-3">Total (INR)</th>
              <th className="py-2 pr-3">Paid</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.invoices ?? []).map((inv) => {
              const sch = Array.isArray(inv.schools) ? inv.schools[0] : inv.schools;
              return (
                <tr key={inv.id} className="border-b border-line last:border-0">
                  <td className="py-2.5 pr-3 font-mono font-bold">{inv.invoice_number}</td>
                  <td className="py-2.5 pr-3">{sch?.name ?? "School"} ({sch?.school_code ?? "—"})</td>
                  <td className="py-2.5 pr-3">{formatInr(Number(inv.subtotal_inr))}</td>
                  <td className="py-2.5 pr-3">{formatInr(Number(inv.gst_amount_inr))}</td>
                  <td className="py-2.5 pr-3 font-semibold">{formatInr(Number(inv.total_inr))}</td>
                  <td className="py-2.5 pr-3">{formatInr(Number(inv.amount_paid_inr))}</td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge tone={inv.status === "paid" ? "success" : "warning"}>{inv.status}</StatusBadge>
                  </td>
                  <td className="py-2.5 text-right space-x-2">
                    <Link href={`/platform/invoices/${inv.id}/print`}>
                      <Button variant="outline" size="sm">Print Tax Invoice</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const stub = createSaaSGatewayCheckoutStub({
                          invoiceId: inv.id,
                          invoiceNumber: inv.invoice_number,
                          schoolCode: sch?.school_code ?? "SCH",
                          amountInr: Number(inv.total_inr),
                        });
                        showToast(stub.message);
                      }}
                    >
                      Gateway Link (Stub)
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
