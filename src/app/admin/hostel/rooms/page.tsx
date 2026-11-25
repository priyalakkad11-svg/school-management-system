"use client";

import { DataTablePage } from "@/components/templates/DataTablePage";
import { MOCK_HOSTEL_ROOMS } from "@/mocks/school.data";
import { formatInr } from "@/lib/utils";
import type { HostelRoom } from "@/types/domain";

export default function HostelRoomsPage() {
  return (
    <DataTablePage<HostelRoom>
      role="admin"
      title="Hostel Dormitories & Rooms"
      subtitle="Boys & Girls Residential Wings with AC/Non-AC capacity and bed availability"
      rows={MOCK_HOSTEL_ROOMS}
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

