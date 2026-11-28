"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { getLiveHostelRoomsAction } from "@/app/actions/live-data.actions";
import { formatInr } from "@/lib/utils";
import type { HostelRoom } from "@/types/domain";

export default function HostelRoomsPage() {
  const [rows, setRows] = React.useState<HostelRoom[]>([]);
  React.useEffect(() => {
    let active = true;
    void getLiveHostelRoomsAction().then((data) => {
      if (active) setRows(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DataTablePage<HostelRoom>
      role="admin"
      title="Hostel Dormitories & Rooms"
      subtitle="Boys & Girls Residential Wings with AC/Non-AC capacity and bed availability"
      rows={rows}
      searchPlaceholder="Search room number, wing, residents..."
      primaryAction={{ label: "Allocate Bed / Room", href: "/admin/hostel/allocations" }}
      filters={[
        {
          key: "status",
          label: "Availability",
          options: [
            { label: "Open", value: "Open" },
            { label: "Full", value: "Full" },
          ],
          predicate: (row, val) => row.status === val,
        },
      ]}
      columns={[
        { id: "room", header: "Room No", accessor: (r) => r.roomNo },
        { id: "wing", header: "Wing", accessor: (r) => r.wing },
        { id: "type", header: "Room Type", accessor: (r) => `${r.type} (${r.floor})` },
        { id: "occ", header: "Occupancy", accessor: (r) => `${r.occupied} / ${r.capacity}` },
        { id: "res", header: "Current Residents", accessor: (r) => r.residents.join(", ") },
        { id: "fee", header: "Monthly Fee", accessor: (r) => formatInr(r.monthlyFee) },
        {
          id: "status",
          header: "Status",
          accessor: (r) => r.status,
          badgeTone: (r) => (r.status === "Open" ? "success" : "info"),
        },
      ]}
    />
  );
}

