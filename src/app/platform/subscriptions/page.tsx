"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  listSubscriptionsAndInvoicesAction,
  queueRenewalRemindersAction,
} from "@/app/actions/platform.actions";
import { formatInr } from "@/lib/saas-pricing";

type BillingData = Extract<
  Awaited<ReturnType<typeof listSubscriptionsAndInvoicesAction>>,
  { ok: true }
>["data"];

export default function PlatformSubscriptionsPage() {
  const { showToast } = useToast();
  const [data, setData] = React.useState<BillingData | null>(null);
  const [queuing, setQueuing] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    void listSubscriptionsAndInvoicesAction().then((res) => {
      if (!active) return;
      if (res.ok) setData(res.data);
      else showToast(res.error, "warning");
    });
    return () => {
      active = false;
    };
  }, [showToast]);

  const handleReminders = async () => {
    setQueuing(true);
    try {
      const res = await queueRenewalRemindersAction();
      if (res.ok && res.data) {
        showToast(`Queued ${res.data.queued} renewal reminder notifications (30/7/1d windows).`);
      } else {
        showToast(res.error ?? "Reminder queue failed.", "warning");
      }
    } finally {
      setQueuing(false);
    }
  };

  return (
    <AppShell
      role="super_admin"
      title="Subscriptions Manager"
      subtitle="Active billing cycles, trial expiries, and automated 30/7/1-day renewal reminders"
      actions={
        <Button size="sm" onClick={handleReminders} disabled={queuing}>
          {queuing ? "Checking Renewals..." : "Queue 30/7/1d Renewal Reminders"}
        </Button>
      }
    >
      <Card className="p-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line text-ink-secondary">
              <th className="py-2 pr-3">School</th>
              <th className="py-2 pr-3">Plan</th>
              <th className="py-2 pr-3">Cycle</th>
              <th className="py-2 pr-3">Student Tier</th>
              <th className="py-2 pr-3">MRR</th>
              <th className="py-2 pr-3">Period End</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.subscriptions ?? []).map((sub) => {
              const sch = Array.isArray(sub.schools) ? sub.schools[0] : sub.schools;
              const pl = Array.isArray(sub.saas_plans) ? sub.saas_plans[0] : sub.saas_plans;
              return (
                <tr key={sub.id} className="border-b border-line last:border-0">
                  <td className="py-2.5 pr-3">
                    <Link href={`/platform/schools/${sub.school_id}`} className="font-semibold text-brand hover:underline">
                      {sch?.name ?? "School"} ({sch?.school_code ?? "—"})
                    </Link>
                  </td>
                  <td className="py-2.5 pr-3">{pl?.name ?? "Plan"}</td>
                  <td className="py-2.5 pr-3 capitalize">{sub.billing_cycle}</td>
                  <td className="py-2.5 pr-3">{sub.student_count_tier}</td>
                  <td className="py-2.5 pr-3 font-semibold">{sch?.is_demo ? "₹0 (Demo)" : formatInr(Number(sub.monthly_rate_inr))}</td>
                  <td className="py-2.5 pr-3 text-ink-secondary">
                    {new Date(sub.current_period_end).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-2.5">
                    <StatusBadge tone={sub.status === "active" ? "success" : sub.status === "trial" ? "info" : "warning"}>
                      {sub.status}
                    </StatusBadge>
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
