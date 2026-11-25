"use client";

import React from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, StatusBadge, Tabs } from "@/components/ui/primitives";
import type { PortalRole } from "@/lib/routes";
import type { StatusTone } from "@/types/domain";

export interface CalendarSlotItem {
  id: string;
  dayOrDate: string;
  timeRange: string;
  title: string;
  location: string;
  tag: string;
  tone: StatusTone;
}

export function CalendarView({
  role,
  title,
  subtitle,
  items,
  categories,
  actions,
}: {
  role: PortalRole;
  title: string;
  subtitle?: string;
  items: CalendarSlotItem[];
  categories?: { key: string; label: string }[];
  actions?: React.ReactNode;
}) {
  const [selectedCat, setSelectedCat] = React.useState(categories?.[0]?.key ?? "all");

  const filtered = React.useMemo(() => {
    if (!categories || selectedCat === "all") return items;
    return items.filter((i) => i.tag.toLowerCase() === selectedCat.toLowerCase() || i.dayOrDate === selectedCat);
  }, [items, categories, selectedCat]);

  return (
    <AppShell role={role} title={title} subtitle={subtitle} actions={actions}>
      {categories ? (
        <Tabs items={categories} active={selectedCat} onChange={setSelectedCat} />
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="p-5 flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand">
                <CalendarDays className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.dayOrDate}</span>
              </div>
              <StatusBadge tone={item.tone}>{item.tag}</StatusBadge>
            </div>
            <h3 className="text-base font-bold text-ink">{item.title}</h3>
            <div className="flex flex-col gap-1.5 text-xs text-ink-secondary pt-2 border-t border-line">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {item.timeRange}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                {item.location}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

