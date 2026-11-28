"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { getLiveRoutesAction, getLiveStudentsAction } from "@/app/actions/live-data.actions";
import type { Student, TransportRoute } from "@/types/domain";

export default function StudentTransportAssignmentPage() {
  const { showToast } = useToast();
  const [routes, setRoutes] = React.useState<TransportRoute[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [route, setRoute] = React.useState("");

  React.useEffect(() => {
    let active = true;
    void Promise.all([getLiveRoutesAction(), getLiveStudentsAction()]).then(([rRows, sRows]) => {
      if (!active) return;
      setRoutes(rRows);
      setStudents(sRows);
      if (rRows[0]) setRoute(`${rRows[0].code} (${rRows[0].title})`);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell
      role="admin"
      title="Student Transport & Stop Allocation"
      subtitle="Map students to morning/afternoon bus routes and auto-bill transport fees"
      actions={
        <Button variant="primary" onClick={() => showToast(`Updated bus stop roster for ${route || "selected route"}.`)}>
          Save Route Manifest
        </Button>
      }
    >
      <div className="w-full sm:w-80">
        <Select
          label="Bus Route"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          options={
            routes.length > 0
              ? routes.map((rt) => ({ label: `${rt.code} (${rt.title})`, value: `${rt.code} (${rt.title})` }))
              : [{ label: "Route #01", value: "Route #01" }]
          }
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
              {students.map((s) => (
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

