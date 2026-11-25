import { AppShell } from "@/components/layout/AppShell";
import { Card, StatusBadge } from "@/components/ui/primitives";
import { MOCK_ROUTES } from "@/mocks/school.data";

export default function VehiclesDriversPage() {
  return (
    <AppShell
      role="admin"
      title="Fleet Vehicles & Licensed Drivers"
      subtitle="RTO fitness certificates, GPS tracker IDs, and driver contact logs"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_ROUTES.map((r) => (
          <Card key={r.id} className="p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand">{r.code}</span>
              <StatusBadge tone={r.status === "On Route" ? "success" : r.status === "Parked" ? "info" : "warning"}>
                {r.status}
              </StatusBadge>
            </div>
            <h2 className="text-base font-bold text-ink">{r.busNo}</h2>
            <p className="text-sm text-ink-secondary">{r.title}</p>
            <div className="pt-2 border-t border-line text-xs text-ink-secondary flex flex-col gap-1">
              <div>Driver: {r.driverName}</div>
              <div>Contact: {r.driverPhone}</div>
              <div>Seats Occupied: {r.occupied} / {r.capacity}</div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

