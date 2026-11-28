"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { getLiveRoutesAction } from "@/app/actions/live-data.actions";
import { formatInr } from "@/lib/utils";
import type { TransportRoute } from "@/types/domain";

export default function TransportRoutesPage() {
  const [rows, setRows] = React.useState<TransportRoute[]>([]);
  React.useEffect(() => {
    let active = true;
    void getLiveRoutesAction().then((data) => {
      if (active) setRows(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DataTablePage<TransportRoute>
      role="admin"
      title="School Bus Routes & GPS Tracking"
      subtitle="Active school transport corridors with driver & vehicle telemetry"
      rows={rows}
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

