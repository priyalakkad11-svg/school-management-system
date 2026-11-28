"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, EmptyState, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { getLiveNotificationsAction } from "@/app/actions/live-data.actions";
import { markAllNotificationsReadAction } from "@/app/actions/academics-finance.actions";
import type { NotificationItem } from "@/types/domain";
import { cn } from "@/lib/utils";

const FILTER_TABS = [
  { key: "all", label: "All Alerts" },
  { key: "unread", label: "Unread" },
  { key: "Fees", label: "Fees & Alerts" },
  { key: "Academic", label: "Academic" },
  { key: "System", label: "System" },
];

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => {
    let active = true;
    void getLiveNotificationsAction().then((data) => {
      if (active) setItems(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((n) => n.unread);
    return items.filter((n) => n.category === filter);
  }, [items, filter]);

  const markAllRead = async () => {
    const res = await markAllNotificationsReadAction();
    if (!res.ok) {
      showToast(res.error ?? "Failed marking read.", "warning");
      return;
    }
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast("All notifications marked as read.");
  };

  const toggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)),
    );
  };

  return (
    <AppShell
      role="common"
      title="Notifications Center"
      subtitle="Real-time alerts across fee payments, leave requests, exams, and fleet tracking"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter notifications">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "min-h-11 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer",
                  active
                    ? "bg-brand text-ink-on-dark"
                    : "bg-surface text-ink-secondary border border-line hover:bg-subtle",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <Button variant="secondary" onClick={markAllRead}>
          Mark All as Read
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No notifications in this filter"
          description="You are all caught up across this category."
          action={
            <Button variant="outline" onClick={() => setFilter("all")}>
              Show All Alerts
            </Button>
          }
        />
      ) : (
        <Card className="divide-y divide-line overflow-hidden">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleRead(item.id)}
              className={cn(
                "w-full text-left p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-subtle/60 cursor-pointer",
                item.unread && "bg-brand-soft/30",
              )}
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  {item.unread ? (
                    <span className="w-2 h-2 rounded-full bg-brand shrink-0" aria-hidden="true" />
                  ) : null}
                  <span className="text-sm font-bold text-ink">{item.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-ink-secondary">{item.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                <StatusBadge tone={item.tone}>{item.tag}</StatusBadge>
                <span className="text-xs text-ink-muted whitespace-nowrap">{item.time}</span>
              </div>
            </button>
          ))}
        </Card>
      )}
    </AppShell>
  );
}

