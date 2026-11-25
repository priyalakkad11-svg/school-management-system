"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, StatusBadge } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";

const SCHOLARSHIPS = [
  { id: "sc-1", name: "Merit Academic Excellence (>90%)", discount: "10% Tuition Waiver", beneficiaries: 42, status: "Active" },
  { id: "sc-2", name: "Sibling Concession Plan", discount: "₹2,500 / Term", beneficiaries: 68, status: "Active" },
  { id: "sc-3", name: "National Sports Quota Grant", discount: "50% Tuition + Kit", beneficiaries: 14, status: "Active" },
  { id: "sc-4", name: "Staff Ward Fee Concession", discount: "75% Tuition Waiver", beneficiaries: 19, status: "Active" },
];

export default function ScholarshipsPage() {
  const { showToast } = useToast();
  const [list, setList] = React.useState(SCHOLARSHIPS);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [discount, setDiscount] = React.useState("15% Tuition Waiver");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setList((prev) => [
      { id: `sc-${Date.now()}`, name: name.trim(), discount, beneficiaries: 0, status: "Active" },
      ...prev,
    ]);
    setModalOpen(false);
    setName("");
    showToast("Scholarship scheme added.");
  };

  return (
    <AppShell
      role="admin"
      title="Discounts & Scholarships"
      subtitle="Manage merit scholarships, sibling waivers, and RTE concessions"
      actions={
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + New Scholarship Scheme
        </Button>
      }
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scholarships table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Scheme Name</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Waiver Value</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Students Enrolled</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((s) => (
                <tr key={s.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{s.name}</td>
                  <td className="py-3.5 px-4 text-sm text-brand font-medium">{s.discount}</td>
                  <td className="py-3.5 px-4 text-sm text-ink">{s.beneficiaries}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone="success">{s.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Scholarship Scheme">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <Input label="Scheme Title" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Waiver Rule" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          <Button type="submit" variant="primary" className="w-full">
            Save Scholarship
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}

