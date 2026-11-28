"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { SetupService } from "@/services/setup.service";
import type { TableQueryParams } from "@/lib/query";
import type { SchoolClass } from "@/types/domain";

export default function AdminClassesListPage() {
  const [query, setQuery] = React.useState<TableQueryParams>({ page: 1, pageSize: 8 });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["setup-classes", query],
    queryFn: () => SetupService.listClasses(query),
  });

  const rows = data?.ok && data.data ? data.data.rows : [];
  const total = data?.ok && data.data ? data.data.total : 0;
  const errorMsg = data && !data.ok ? (data.error ?? "Unable to load classes.") : null;

  return (
    <DataTablePage<SchoolClass>
      role="admin"
      title="Classes & Sections Directory"
      subtitle="Active Classes & Sections across Pre-Primary to Grade 12"
      rows={rows}
      searchPlaceholder="Class 10..."
      primaryAction={{ label: "Add Class & Section", href: "/admin/setup/classes/manage" }}
      serverSide={{
        total,
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 8,
        loading: isLoading,
        error: errorMsg,
        onRetry: () => void refetch(),
        onQueryChange: setQuery,
      }}
      filters={[
        {
          key: "wing",
          label: "Wing / Grade Group",
          options: [
            { label: "Senior Wing", value: "Senior Wing" },
            { label: "Middle Wing", value: "Middle Wing" },
            { label: "Lab Wing", value: "Lab Wing" },
          ],
          predicate: (row, val) => row.wing === val,
        },
      ]}
      columns={[
        {
          id: "name",
          header: "Class",
          accessor: (r) => r.name,
          href: (r) => `/admin/setup/classes/manage?id=${encodeURIComponent(r.id)}`,
        },
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
