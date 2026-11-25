"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const ABSENT_SLOTS = [
  { id: "sb-1", absent: "Ms. Clara D'Souza", cls: "Class 10–A (P2 English)", substitute: "Mrs. Priya Mehta", assigned: true },
  { id: "sb-2", absent: "Ms. Clara D'Souza", cls: "Class 9–A (P4 English)", substitute: "Mr. Rohan Deshmukh", assigned: false },
];

export default function SubstitutionManagementPage() {
  const { showToast } = useToast();
  const [slots, setSlots] = React.useState(ABSENT_SLOTS);

  const assignSub = (id: string) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, assigned: true } : s)));
    showToast("Substitute teacher assigned and notified.");
  };

  return (
    <AppShell
      role="admin"
      title="Daily Substitute Arrangement"
      subtitle="Assign available free-period teachers for faculty on approved leave"
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Substitution table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Faculty on Leave</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Affected Period</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Assigned Substitute</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {slots.map((s) => (
                <tr key={s.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{s.absent}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{s.cls}</td>
                  <td className="py-3.5 px-4">
                    <Select
                      aria-label={`Substitute for ${s.cls}`}
                      defaultValue={s.substitute}
                      options={[
                        { label: "Mrs. Priya Mehta", value: "Mrs. Priya Mehta" },
                        { label: "Mr. Rohan Deshmukh", value: "Mr. Rohan Deshmukh" },
                        { label: "Mr. Arjun Menon", value: "Mr. Arjun Menon" },
                      ]}
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={s.assigned ? "success" : "warning"}>
                      {s.assigned ? "Confirmed" : "Needs Cover"}
                    </StatusBadge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Button size="sm" variant="primary" onClick={() => assignSub(s.id)}>
                      Confirm Cover
                    </Button>
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

