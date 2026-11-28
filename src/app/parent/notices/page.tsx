"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { acknowledgeNoticeAction } from "@/app/actions/academics-finance.actions";
import { getLiveNoticesAction } from "@/app/actions/live-data.actions";

interface NoticeRow {
  id: string;
  title: string;
  audience: string;
  published: string;
  eventDate: string;
  ack: string;
  tone: "success" | "primary" | "neutral";
}

export default function ParentNoticesPage() {
  const { showToast } = useToast();
  const [items, setItems] = React.useState<NoticeRow[]>([]);

  React.useEffect(() => {
    let active = true;
    void getLiveNoticesAction().then((notices) => {
      if (!active) return;
      setItems(
        notices.map((n, idx) => ({
          id: n.id,
          title: n.title,
          audience: n.audience,
          published: n.date,
          eventDate: n.eventDate ?? n.date,
          ack: idx === 0 ? "RSVP Confirmed" : "Confirm Read",
          tone: idx === 0 ? "success" : "primary",
        })),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  const acknowledge = async (row: NoticeRow) => {
    const res = await acknowledgeNoticeAction({ noticeId: row.id, title: row.title });
    if (!res.ok) {
      showToast(res.error ?? "Unable to acknowledge circular.", "warning");
      return;
    }
    setItems((prev) =>
      prev.map((c) =>
        c.id === row.id ? { ...c, ack: "Acknowledged", tone: "success" as const } : c,
      ),
    );
    showToast("Acknowledged school circular.", "success");
  };

  return (
    <AppShell
      role="parent"
      title="School Circulars & Events"
      subtitle="Official school circulars, PTM invitations, and event acknowledgements"
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            Official School Circulars &amp; PTM Schedule
          </h2>
          <span className="text-xs text-ink-muted">{items.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Parent circulars table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Title</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Audience</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Published</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Event Date</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Acknowledge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{item.title}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{item.audience}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{item.published}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{item.eventDate}</td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => void acknowledge(item)}
                      className="cursor-pointer rounded-full"
                    >
                      <StatusBadge tone={item.tone}>{item.ack}</StatusBadge>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

