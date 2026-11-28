"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { Button, Input } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";
import { SetupService } from "@/services/setup.service";
import type { TableQueryParams } from "@/lib/query";
import type { AcademicYear } from "@/types/domain";

export default function AcademicYearsPage() {
  const { showToast } = useToast();
  const [query, setQuery] = React.useState<TableQueryParams>({ page: 1, pageSize: 8 });
  const [modalOpen, setModalOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [name, setName] = React.useState("AY 2028–29 (Planned)");
  const [startDate, setStartDate] = React.useState("2028-04-01");
  const [endDate, setEndDate] = React.useState("2029-03-31");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["setup-academic-years", query],
    queryFn: () => SetupService.listAcademicYears(query),
  });

  const years = data?.ok && data.data ? data.data.rows : [];
  const total = data?.ok && data.data ? data.data.total : 0;
  const errorMsg = data && !data.ok ? (data.error ?? "Unable to load academic sessions.") : null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await SetupService.createAcademicYear({ name, startDate, endDate });
      if (!res.ok) {
        showToast(res.error ?? "Unable to create academic year.", "warning");
        return;
      }
      setModalOpen(false);
      showToast(`Created academic session ${name}.`);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (row: AcademicYear) => {
    const res = await SetupService.setActiveAcademicYear(row.id);
    if (!res.ok) {
      showToast(res.error ?? "Unable to activate session.", "warning");
      return;
    }
    showToast(`${row.name} is now the active academic session.`);
    await refetch();
  };

  const handleDelete = async (row: AcademicYear) => {
    const res = await SetupService.deleteAcademicYear(row.id);
    if (!res.ok) {
      showToast(res.error ?? "Unable to archive session.", "warning");
      return;
    }
    showToast(`Removed ${row.name}.`);
    await refetch();
  };

  return (
    <>
      <DataTablePage<AcademicYear>
        role="admin"
        title="Academic Year / Session Management"
        subtitle="Manage school sessions, term dates, and active enrollment year"
        rows={years}
        searchPlaceholder="Search session..."
        primaryAction={{
          label: "Create New Academic Year",
          onClick: () => setModalOpen(true),
        }}
        serverSide={{
          total,
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 8,
          loading: isLoading,
          error: errorMsg,
          onRetry: () => void refetch(),
          onQueryChange: setQuery,
        }}
        columns={[
          { id: "name", header: "Session Name", accessor: (r) => r.name },
          { id: "start", header: "Start Date", accessor: (r) => r.startDate },
          { id: "end", header: "End Date", accessor: (r) => r.endDate },
          { id: "students", header: "Students", accessor: (r) => r.studentsCount.toLocaleString() },
          {
            id: "status",
            header: "Status",
            accessor: (r) => (r.status === "Active" ? "Active Session" : r.status),
            badgeTone: (r) =>
              r.status === "Active" ? "success" : r.status === "Upcoming" ? "info" : "neutral",
          },
        ]}
        rowActions={(r) => (
          <div className="inline-flex items-center gap-2">
            {r.status !== "Active" ? (
              <Button size="sm" variant="outline" onClick={() => void handleActivate(r)}>
                Set Active
              </Button>
            ) : null}
            {r.status !== "Active" ? (
              <Button size="sm" variant="ghost" onClick={() => void handleDelete(r)}>
                Remove
              </Button>
            ) : (
              <span className="text-xs font-medium text-success">Current</span>
            )}
          </div>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Academic Year">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Session Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
            {submitting ? "Saving Session..." : "Save Academic Year"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
