"use client";

import { DataTablePage } from "@/components/templates/DataTablePage";
import { MOCK_ROUTES } from "@/mocks/school.data";
import { formatInr } from "@/lib/utils";
import type { TransportRoute } from "@/types/domain";

export default function TransportRoutesPage() {
  return (
    <DataTablePage<TransportRoute>
      role="admin"
      title="School Bus Routes & GPS Tracking"
      subtitle="18 Active Routes across Pune with real-time RFID student boarding telemetry"
      rows={MOCK_ROUTES}
      searchPlaceholder="Search route code, stop, driver..."
      primaryAction={{ label: "Assign Students", href: "/admin/transport/assignments" }}
      secondaryActions={[{ label: "Vehicles & Drivers", href: "/admin/transport/vehicles" }]}
      columns={[
        { id: "code", header: "Route Code", accessor: (r) => r.code },
        { id: "title", header: "Corridor Title", accessor: (r) => r.title },
        { id: "coverage", header: "Key Stops", accessor: (r) => r.coverage },
        { id: "bus", header: "Assigned Bus", accessor: (r) => r.busNo },
        { id: "occupancy", header: "Occupancy", accessor: (r) => `${r.occupied} / ${r.capacity}` },
        { id: "fee", header: "Monthly Fee", accessor: (r) => formatInr(r.monthlyFee) },
        {
          id: "status",
          header: "Telemetry",
          accessor: (r) => r.status,
          badgeTone: (r) =>
            r.status === "On Route" ? "success" : r.status === "Parked" ? "info" : "warning",
        },
      ]}
    />
  );
}

