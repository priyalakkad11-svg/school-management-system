"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, StatusBadge } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";
import { createFeeHeadAndStructureAction } from "@/app/actions/academics-finance.actions";
import { formatInr } from "@/lib/utils";

const INITIAL_HEADS = [
  { id: "fh-1", name: "Term Tuition Fee (Grades 9–12)", freq: "Per Term (3x)", amount: 18500, optional: false },
  { id: "fh-2", name: "Science & Computer Lab Fee", freq: "Annual", amount: 3500, optional: false },
  { id: "fh-3", name: "Admission & Registration Fee", freq: "One-Time", amount: 5500, optional: false },
  { id: "fh-4", name: "GPS School Bus Transport", freq: "Monthly", amount: 2600, optional: true },
];

export default function FeeStructureSetupPage() {
  const { showToast } = useToast();
  const [heads, setHeads] = React.useState(INITIAL_HEADS);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState("4500");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await createFeeHeadAndStructureAction({
      headName: name.trim(),
      headCode: `FH${Math.floor(10 + Math.random() * 89)}`,
      amountInr: Number(amount) || 0,
      dueDate: "2026-12-31",
    });
    if (!res.ok) {
      showToast(res.error ?? "Unable to add fee head.", "warning");
      return;
    }
    setHeads((prev) => [
      { id: `fh-${Date.now()}`, name: name.trim(), freq: "Annual", amount: Number(amount) || 0, optional: true },
      ...prev,
    ]);
    setModalOpen(false);
    setName("");
    showToast("Fee head saved to AY 2026–27 catalog.");
  };

  return (
    <AppShell
      role="admin"
      title="Fee Structure & Installment Setup"
      subtitle="Configure tuition slabs, laboratory charges, transport fees, and due schedules"
      actions={
        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/fees/collect">
            <Button variant="outline">Collect Fee</Button>
          </Link>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            + Add Fee Head
          </Button>
        </div>
      }
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Fee heads catalog">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Fee Head</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Frequency</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Amount</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {heads.map((h) => (
                <tr key={h.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{h.name}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{h.freq}</td>
                  <td className="py-3.5 px-4 text-sm font-bold text-ink">{formatInr(h.amount)}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={h.optional ? "info" : "success"}>
                      {h.optional ? "Optional" : "Mandatory"}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Fee Head">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <Input label="Fee Head Title" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Amount (INR)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button type="submit" variant="primary" className="w-full">
            Save Fee Head
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}

