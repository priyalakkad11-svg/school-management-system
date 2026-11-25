"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, Button, Card, StatusBadge, Tabs } from "@/components/ui/primitives";
import type { PortalRole } from "@/lib/routes";
import type { StatusTone } from "@/types/domain";

export interface DetailTabItem {
  key: string;
  label: string;
  content: React.ReactNode;
}

export interface DetailPageProps {
  role: PortalRole;
  title: string;
  subtitle?: string;
  entityName: string;
  entityInitials: string;
  entityMeta: string;
  statusLabel: string;
  statusTone?: StatusTone;
  backHref?: string;
  backLabel?: string;
  headerActions?: React.ReactNode;
  quickMetrics?: { label: string; value: string }[];
  tabs: DetailTabItem[];
}

export function DetailPage({
  role,
  title,
  subtitle,
  entityName,
  entityInitials,
  entityMeta,
  statusLabel,
  statusTone = "success",
  backHref,
  backLabel = "Back to List",
  headerActions,
  quickMetrics = [],
  tabs,
}: DetailPageProps) {
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.key ?? "");
  const currentTab = tabs.find((t) => t.key === activeTab) ?? tabs[0];

  return (
    <AppShell
      role={role}
      title={title}
      subtitle={subtitle}
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          {backHref ? (
            <Link href={backHref}>
              <Button variant="outline">{backLabel}</Button>
            </Link>
          ) : null}
          {headerActions}
        </div>
      }
    >
      <Card className="p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar initials={entityInitials} size="lg" />
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-ink">{entityName}</h2>
                <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
              </div>
              <p className="text-sm text-ink-secondary">{entityMeta}</p>
            </div>
          </div>

          {quickMetrics.length > 0 ? (
            <div className="grid grid-cols-2 sm:flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-line">
              {quickMetrics.map((m) => (
                <div key={m.label} className="sm:px-4 sm:border-l border-line first:border-l-0">
                  <div className="text-xs text-ink-secondary">{m.label}</div>
                  <div className="text-base font-bold text-ink">{m.value}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {tabs.length > 1 ? (
          <div className="pt-2 border-t border-line">
            <Tabs
              items={tabs.map((t) => ({ key: t.key, label: t.label }))}
              active={currentTab?.key ?? ""}
              onChange={setActiveTab}
            />
          </div>
        ) : null}
      </Card>

      {currentTab?.content}
    </AppShell>
  );
}

