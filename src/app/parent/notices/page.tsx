"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const CIRCULARS = [
  { id: "pc-1", title: "Parent-Teacher Meeting (Term 1 Review)", audience: "Classes 1–12 Parents", published: "24 Nov 2026", eventDate: "05 Dec 2026", ack: "RSVP Confirmed", tone: "success" as const },
  { id: "pc-2", title: "Annual Science & Robotics Expo", audience: "All Parents", published: "20 Nov 2026", eventDate: "12 Dec 2026", ack: "Confirm RSVP", tone: "primary" as const },
  { id: "pc-3", title: "Winter Uniform & Timing Circular", audience: "All Students", published: "18 Nov 2026", eventDate: "01 Dec 2026", ack: "Mark Read", tone: "neutral" as const },
];

export default function ParentNoticesPage() {
  const { showToast } = useToast();
  const [items, setItems] = React.useState(CIRCULARS);

  const acknowledge = (id: string) => {
    setItems((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ack: "RSVP Confirmed", tone: "success" as const } : c,
      ),
    );
    showToast("Acknowledged school circular.");
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
                      onClick={() => acknowledge(item.id)}
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

