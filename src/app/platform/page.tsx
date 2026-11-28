"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { getPlatformDashboardAction, type PlatformDashboardDto } from "@/app/actions/platform.actions";
import { formatInr } from "@/lib/saas-pricing";

export default function PlatformDashboardPage() {
  const { showToast } = useToast();
  const [data, setData] = React.useState<PlatformDashboardDto | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    void getPlatformDashboardAction().then((res) => {
      if (!res.ok || !res.data) {
        showToast(res.error ?? "Unable to load platform metrics.", "warning");
      } else {
        setData(res.data);
      }
      setLoading(false);
    });
  }, [showToast]);

  const m = data?.metrics;

  return (
    <AppShell
      role="super_admin"
      title="Platform Owner Console"
      subtitle="Multi-school SaaS revenue, tenant health, renewals, and onboarding control"
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href="/platform/mfa">
            <Button variant="outline" size="sm">TOTP MFA Security</Button>
          </Link>
          <Link href="/platform/schools/new">
            <Button size="sm">+ Create School</Button>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-secondary">Active Real Schools</span>
          <strong className="text-2xl font-bold text-ink">{loading ? "—" : m?.activeSchools ?? 0}</strong>
          <span className="text-xs text-ink-muted">
            Trial: {m?.trialSchools ?? 0} · Suspended/RO: {m?.suspendedSchools ?? 0}
          </span>
        </Card>
        <Card className="p-5 flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-secondary">Real SaaS MRR (INR)</span>
          <strong className="text-2xl font-bold text-brand">
            {loading ? "—" : formatInr(m?.mrrInr ?? 0)}
          </strong>
          <span className="text-xs text-ink-muted">
            ARR: {formatInr(m?.arrInr ?? 0)} (Demo excluded)
          </span>
        </Card>
        <Card className="p-5 flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-secondary">Total Enrolled Students</span>
          <strong className="text-2xl font-bold text-ink">{loading ? "—" : m?.totalRealStudents ?? 0}</strong>
          <span className="text-xs text-ink-muted">Across {m?.totalRealSchools ?? 0} real schools</span>
        </Card>
        <Card className="p-5 flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-secondary">Renewals Due (30d)</span>
          <strong className="text-2xl font-bold text-warning">{loading ? "—" : m?.renewalsDue30d ?? 0}</strong>
          <span className="text-xs text-ink-muted">
            Open Support Tickets: {data?.openTicketsCount ?? 0}
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-ink">Recent Schools</h2>
              <p className="text-xs text-ink-secondary">Newest provisioned tenants & showcase Demo School</p>
            </div>
            <Link href="/platform/schools" className="text-xs font-semibold text-brand hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-ink-secondary">
                  <th className="py-2 pr-3 font-semibold">Code</th>
                  <th className="py-2 pr-3 font-semibold">School</th>
                  <th className="py-2 pr-3 font-semibold">Plan</th>
                  <th className="py-2 pr-3 font-semibold">MRR</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentSignups ?? []).map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3 font-mono font-semibold text-ink">{s.schoolCode}</td>
                    <td className="py-2.5 pr-3">
                      <Link href={`/platform/schools/${s.id}`} className="font-semibold text-brand hover:underline">
                        {s.name}
                      </Link>
                      {s.isDemo ? (
                        <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-subtle text-ink-secondary">
                          DEMO
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-3 text-ink-secondary">{s.planName}</td>
                    <td className="py-2.5 pr-3 font-medium text-ink">
                      {s.isDemo ? "₹0 (Demo)" : formatInr(s.monthlyRateInr)}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge
                        tone={
                          s.status === "active"
                            ? "success"
                            : s.status === "trial"
                              ? "info"
                              : s.status === "past_due"
                                ? "warning"
                                : "danger"
                        }
                      >
                        {s.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
                {!loading && (data?.recentSignups.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-ink-muted">
                      No schools provisioned yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-ink">Upcoming Renewals (Next 30 Days)</h2>
              <p className="text-xs text-ink-secondary">Subscriptions requiring billing follow-up</p>
            </div>
            <Link href="/platform/subscriptions" className="text-xs font-semibold text-brand hover:underline">
              Manage Subscriptions
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-ink-secondary">
                  <th className="py-2 pr-3 font-semibold">School</th>
                  <th className="py-2 pr-3 font-semibold">Plan</th>
                  <th className="py-2 pr-3 font-semibold">Period End</th>
                  <th className="py-2 font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody>
                {(data?.renewalsDue ?? []).map((r) => (
                  <tr key={r.schoolId} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3">
                      <Link href={`/platform/schools/${r.schoolId}`} className="font-semibold text-brand hover:underline">
                        {r.schoolName} ({r.schoolCode})
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 text-ink-secondary">{r.planName}</td>
                    <td className="py-2.5 pr-3 text-ink-secondary">
                      {new Date(r.periodEnd).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-2.5 font-medium text-ink">{formatInr(r.monthlyRateInr)}</td>
                  </tr>
                ))}
                {!loading && (data?.renewalsDue.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-ink-muted">
                      No renewals falling due in the next 30 days.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
