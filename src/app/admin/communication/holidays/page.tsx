"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, StatusBadge } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";

const HOLIDAYS = [
  { id: "h1", date: "25 Dec 2026", title: "Christmas Day", type: "Gazetted Holiday" },
  { id: "h2", date: "26 Dec – 03 Jan 2027", title: "Winter Vacation Break", type: "Campus Break" },
  { id: "h3", date: "14 Jan 2027", title: "Makar Sankranti", type: "Regional Holiday" },
  { id: "h4", date: "26 Jan 2027", title: "Republic Day Flag Hoisting", type: "National Observance" },
];

export default function HolidayListPage() {
  const { showToast } = useToast();
  const [holidays, setHolidays] = React.useState(HOLIDAYS);
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState("");
  const [title, setTitle] = React.useState("");

  const addHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;
    setHolidays((prev) => [{ id: `h-${Date.now()}`, date, title, type: "Academic Break" }, ...prev]);
    setOpen(false);
    setDate("");
    setTitle("");
    showToast("Added holiday to academic calendar.");
  };

  return (
    <AppShell
      role="admin"
      title="Official Holiday List — AY 2026–27"
      subtitle="Published gazetted holidays and term breaks synced with attendance schedules"
      actions={
        <Button variant="primary" onClick={() => setOpen(true)}>
          + Add Holiday
        </Button>
      }
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Holiday list">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Date</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Occasion</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {holidays.map((h) => (
                <tr key={h.id}>
                  <td className="py-3.5 px-4 text-sm font-bold text-ink">{h.date}</td>
                  <td className="py-3.5 px-4 text-sm text-ink">{h.title}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone="info">{h.type}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Holiday">
        <form onSubmit={addHoliday} className="flex flex-col gap-4">
          <Input label="Date / Range" placeholder="e.g., 15 Aug 2026" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Occasion" placeholder="e.g., Independence Day" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button type="submit" variant="primary" className="w-full">
            Save Holiday
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}

