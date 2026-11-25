"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { MOCK_STUDENTS } from "@/mocks/school.data";

export default function StudentTransportAssignmentPage() {
  const { showToast } = useToast();
  const [route, setRoute] = React.useState("Route #04 (Baner – Oakridge Express)");

  return (
    <AppShell
      role="admin"
      title="Student Transport & Stop Allocation"
      subtitle="Map students to morning/afternoon bus routes and auto-bill transport fees"
      actions={
        <Button variant="primary" onClick={() => showToast(`Updated bus stop roster for ${route}.`)}>
          Save Route Manifest
        </Button>
      }
    >
      <div className="w-full sm:w-80">
        <Select
          label="Bus Route"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          options={[
            { label: "Route #04 (Baner – Oakridge Express)", value: "Route #04 (Baner – Oakridge Express)" },
            { label: "Route #01 (Kothrud – Paud Road)", value: "Route #01 (Kothrud – Paud Road)" },
            { label: "Route #07 (Wakad – Hinjewadi Ph 1)", value: "Route #07 (Wakad – Hinjewadi Ph 1)" },
          ]}
        />
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Student transport assignments">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Admission ID</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Student</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Class</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Assigned Route</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">RFID Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {MOCK_STUDENTS.map((s) => (
                <tr key={s.id}>
                  <td className="py-3.5 px-4 text-sm font-bold text-ink">{s.admissionId}</td>
                  <td className="py-3.5 px-4 text-sm text-ink">{s.name}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{s.className}–{s.section}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{s.transportRoute}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={s.transportRoute.includes("Bus") ? "success" : "neutral"}>
                      {s.transportRoute.includes("Bus") ? "Active Pass" : "Walker"}
                    </StatusBadge>
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

