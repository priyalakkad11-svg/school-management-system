"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { Button, Input } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";
import { MOCK_ACADEMIC_YEARS } from "@/mocks/school.data";
import type { AcademicYear } from "@/types/domain";

export default function AcademicYearsPage() {
  const { showToast } = useToast();
  const [years, setYears] = React.useState<AcademicYear[]>(MOCK_ACADEMIC_YEARS);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [name, setName] = React.useState("AY 2028–29 (Planned)");
  const [startDate, setStartDate] = React.useState("01 Apr 2028");
  const [endDate, setEndDate] = React.useState("31 Mar 2029");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setYears((prev) => [
      { id: `ay-${Date.now()}`, name, startDate, endDate, studentsCount: 0, status: "Upcoming" },
      ...prev,
    ]);
    setModalOpen(false);
    showToast(`Created academic session ${name}.`);
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
          <Button
            size="sm"
            variant="ghost"
            onClick={() => showToast(`Opened term configuration for ${r.name}.`)}
          >
            {r.status === "Active" ? "Configure Terms" : r.status === "Upcoming" ? "Setup Admissions" : "View Archive"}
          </Button>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Academic Year">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input label="Session Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Button type="submit" variant="primary" className="w-full">
            Save Academic Year
          </Button>
        </form>
      </Modal>
    </>
  );
}

