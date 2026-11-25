"use client";

import { DataTablePage } from "@/components/templates/DataTablePage";
import { MOCK_CLASSES } from "@/mocks/school.data";
import type { SchoolClass } from "@/types/domain";

export default function AdminClassesListPage() {
  return (
    <DataTablePage<SchoolClass>
      role="admin"
      title="Classes & Sections Directory"
      subtitle="Active Classes & Sections (42 Sections across Pre-Primary to Grade 12)"
      rows={MOCK_CLASSES}
      searchPlaceholder="Class 10..."
      primaryAction={{ label: "Add Class & Section", href: "/admin/setup/classes/manage" }}
      filters={[
        {
          key: "wing",
          label: "Wing / Grade Group",
          options: [
            { label: "Senior Wing", value: "Senior Wing" },
            { label: "Middle Wing", value: "Middle Wing" },
          ],
          predicate: (row, val) => row.wing === val,
        },
      ]}
      columns={[
        { id: "name", header: "Class", accessor: (r) => r.name, href: () => "/admin/setup/classes/manage" },
        { id: "sections", header: "Sections", accessor: (r) => r.sections.join(", ") },
        { id: "teachers", header: "Class Teachers", accessor: (r) => r.classTeachers },
        { id: "strength", header: "Strength", accessor: (r) => `${r.strength} / ${r.capacity}` },
        { id: "room", header: "Room Wing", accessor: (r) => r.roomBlock },
        {
          id: "status",
          header: "Status",
          accessor: (r) => r.status,
          badgeTone: (r) => (r.status === "Active" ? "success" : "neutral"),
        },
      ]}
    />
  );
}

