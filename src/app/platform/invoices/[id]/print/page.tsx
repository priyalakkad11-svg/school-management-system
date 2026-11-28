"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { getInvoicePrintDataAction } from "@/app/actions/platform.actions";
import { formatInr } from "@/lib/saas-pricing";

type PrintData = Extract<
  Awaited<ReturnType<typeof getInvoicePrintDataAction>>,
  { ok: true }
>["data"];

export default function PlatformInvoicePrintPage() {
  const params = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [data, setData] = React.useState<PrintData | null>(null);

  React.useEffect(() => {
    void getInvoicePrintDataAction(params.id).then((res) => {
      if (res.ok) setData(res.data);
      else showToast(res.error, "warning");
    });
  }, [params.id, showToast]);

  if (!data) {
    return (
      <AppShell role="super_admin" title="GST Invoice Print View">
        <Card className="p-6 text-sm text-ink-secondary">Loading GST tax invoice...</Card>
      </AppShell>
    );
  }

  const { invoice, platform, payments } = data;
  const school = Array.isArray(invoice.schools) ? invoice.schools[0] : invoice.schools;
  const lineItems = Array.isArray(invoice.line_items)
    ? (invoice.line_items as Array<{ label?: string; amountInr?: number }>)
    : [];

  return (
    <AppShell
      role="super_admin"
      title={`Tax Invoice ${invoice.invoice_number}`}
      actions={
        <div className="print:hidden">
          <Button onClick={() => window.print()}>Print GST Invoice</Button>
        </div>
      }
    >
      <Card className="p-8 max-w-3xl flex flex-col gap-6">
        <div className="flex flex-wrap justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="text-xl font-bold text-ink">{platform?.company_name ?? "EduCore Technologies"}</h2>
            <p className="text-xs text-ink-secondary">{platform?.company_address}</p>
            <p className="text-xs font-mono text-ink mt-1">GSTIN: {platform?.gstin}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-ink-secondary block">Tax Invoice #</span>
            <strong className="text-lg font-mono text-ink">{invoice.invoice_number}</strong>
            <div className="mt-1">
              <StatusBadge tone={invoice.status === "paid" ? "success" : "warning"}>{invoice.status}</StatusBadge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-ink-secondary block">Billed To School</span>
            <strong className="text-sm text-ink">{school?.name} ({school?.school_code})</strong>
            <p className="text-ink-secondary">{school?.address}</p>
            <p className="text-ink-secondary">{school?.contact_email}</p>
          </div>
          <div className="sm:text-right">
            <span className="text-ink-secondary block">Financial Year &amp; Dates</span>
            <p>FY: <strong>{invoice.financial_year}</strong></p>
            <p>Issued: {new Date(invoice.issued_at).toLocaleDateString("en-IN")}</p>
            <p>Due: {invoice.due_date}</p>
          </div>
        </div>

        <table className="w-full text-left text-xs border-t border-b border-line">
          <thead>
            <tr className="border-b border-line text-ink-secondary">
              <th className="py-2 pr-3">Description</th>
              <th className="py-2 text-right">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li, idx) => (
              <tr key={idx} className="border-b border-line last:border-0">
                <td className="py-2.5 pr-3">{li.label ?? "Subscription"}</td>
                <td className="py-2.5 text-right font-medium">{formatInr(Number(li.amountInr ?? 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="self-end w-full sm:w-72 text-xs flex flex-col gap-1.5">
          <div className="flex justify-between"><span>Taxable Subtotal</span><span>{formatInr(Number(invoice.subtotal_inr))}</span></div>
          {Number(invoice.discount_inr) > 0 ? (
            <div className="flex justify-between text-success"><span>Coupon Discount</span><span>-{formatInr(Number(invoice.discount_inr))}</span></div>
          ) : null}
          <div className="flex justify-between"><span>GST ({invoice.gst_pct}%)</span><span>{formatInr(Number(invoice.gst_amount_inr))}</span></div>
          <div className="flex justify-between text-sm font-bold border-t border-line pt-2"><span>Total Invoice</span><span>{formatInr(Number(invoice.total_inr))}</span></div>
          <div className="flex justify-between text-ink-secondary"><span>Paid to Date</span><span>{formatInr(Number(invoice.amount_paid_inr))}</span></div>
        </div>

        {payments.length > 0 ? (
          <div className="border-t border-line pt-3 text-xs">
            <strong>Settlement History:</strong>
            <ul className="mt-1 flex flex-col gap-1 text-ink-secondary">
              {payments.map((p) => (
                <li key={p.id}>
                  {new Date(p.paid_at).toLocaleDateString("en-IN")} · {p.method} · Ref {p.reference_no} · {formatInr(Number(p.amount_inr))}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </AppShell>
  );
}
