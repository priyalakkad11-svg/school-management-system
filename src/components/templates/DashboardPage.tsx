"use client";

import React from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { Card, StatCard, StatusBadge } from "@/components/ui/primitives";
import type { PortalRole } from "@/lib/routes";
import type { StatusTone } from "@/types/domain";

export interface DashboardKpi {
  title: string;
  value: string;
  delta: string;
  deltaTone?: StatusTone;
  icon?: React.ReactNode;
}

export interface DashboardChartDatum {
  month: string;
  feeLakhs: number;
  attendancePct: number;
}

export interface DashboardNoticeItem {
  id: string;
  title: string;
  tag: string;
  tone: StatusTone;
  href?: string;
}

export interface DashboardActivityRow {
  id: string;
  cells: string[];
  badge?: { label: string; tone: StatusTone };
  href?: string;
}

export interface DashboardPageProps {
  role: PortalRole;
  title: string;
  subtitle?: string;
  kpis: DashboardKpi[];
  chartTitle?: string;
  chartData?: DashboardChartDatum[];
  chartCaption?: string;
  noticesTitle?: string;
  notices?: DashboardNoticeItem[];
  tableTitle: string;
  tableCountLabel?: string;
  tableHeaders: string[];
  tableRows: DashboardActivityRow[];
  bottomNote?: string;
  actions?: React.ReactNode;
}

const emptySubscribe = () => () => {};

export function DashboardPage({
  role,
  title,
  subtitle,
  kpis,
  chartTitle,
  chartData,
  chartCaption,
  noticesTitle = "Campus Notices & Alerts",
  notices,
  tableTitle,
  tableCountLabel,
  tableHeaders,
  tableRows,
  bottomNote,
  actions,
}: DashboardPageProps) {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <AppShell role={role} title={title} subtitle={subtitle} actions={actions}>
      <section aria-label="Key metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            delta={kpi.delta}
            deltaTone={kpi.deltaTone ?? "success"}
            icon={kpi.icon ?? <Users className="w-4 h-4" aria-hidden="true" />}
          />
        ))}
      </section>

      {chartData && chartData.length > 0 ? (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 p-5 flex flex-col gap-3">
            <h2 className="text-base font-bold text-ink">
              {chartTitle ?? "Monthly Fee Collection & Attendance Trend"}
            </h2>
            <div className="h-60 w-full min-w-0">
              {mounted ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                    <XAxis dataKey="month" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} width={32} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface-card)",
                        borderColor: "var(--border-default)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="feeLakhs"
                      name="Fee Collection (₹ Lakhs)"
                      fill="var(--brand-primary)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="attendancePct"
                      name="Attendance %"
                      fill="var(--brand-accent)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 rounded-md bg-subtle animate-pulse" />
              )}
            </div>
            {chartCaption ? (
              <p className="text-xs text-ink-muted">{chartCaption}</p>
            ) : null}
          </Card>

          {notices ? (
            <Card className="p-5 flex flex-col gap-4">
              <h2 className="text-base font-bold text-ink">{noticesTitle}</h2>
              <ul className="flex flex-col divide-y divide-line">
                {notices.map((n) => (
                  <li key={n.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    {n.href ? (
                      <Link href={n.href} className="text-sm font-medium text-ink hover:text-brand">
                        {n.title}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-ink">{n.title}</span>
                    )}
                    <StatusBadge tone={n.tone}>{n.tag}</StatusBadge>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </section>
      ) : null}

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-ink">{tableTitle}</h2>
          {tableCountLabel ? (
            <span className="text-xs font-medium text-ink-muted">{tableCountLabel}</span>
          ) : null}
        </div>

        <div className="hidden md:block overflow-x-auto" tabIndex={0} role="region" aria-label={tableTitle}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                {tableHeaders.map((h) => (
                  <th key={h} className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tableRows.map((row) => (
                <tr key={row.id} className="hover:bg-subtle/60">
                  {row.cells.map((cell, idx) => (
                    <td
                      key={`${row.id}-${idx}`}
                      className={idx === 0 ? "py-3.5 px-4 text-sm font-semibold text-ink" : "py-3.5 px-4 text-sm text-ink-secondary"}
                    >
                      {idx === 0 && row.href ? (
                        <Link href={row.href} className="hover:text-brand hover:underline">
                          {cell}
                        </Link>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                  {row.badge ? (
                    <td className="py-3.5 px-4 text-sm">
                      <StatusBadge tone={row.badge.tone}>{row.badge.label}</StatusBadge>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden flex flex-col gap-3">
          {tableRows.map((row) => (
            <div key={row.id} className="rounded-md border border-line p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">{row.cells[0]}</span>
                {row.badge ? <StatusBadge tone={row.badge.tone}>{row.badge.label}</StatusBadge> : null}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary">
                {row.cells.slice(1).map((c, idx) => (
                  <span key={`${row.id}-m-${idx}`}>{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {bottomNote ? (
        <Card className="p-4 break-words">
          <p className="text-xs font-medium text-ink-secondary">{bottomNote}</p>
        </Card>
      ) : null}
    </AppShell>
  );
}
