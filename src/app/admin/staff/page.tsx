"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { Button, Input, Select } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";
import { MOCK_STAFF } from "@/mocks/school.data";
import { formatInr } from "@/lib/utils";
import type { StaffMember } from "@/types/domain";

export default function AdminNonTeachingStaffPage() {
  const { showToast } = useToast();
  const [staff, setStaff] = React.useState<StaffMember[]>(MOCK_STAFF);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("Accountant");
  const [dept, setDept] = React.useState("Administration");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStaff((prev) => [
      {
        id: `stf-${Date.now()}`,
        empId: `STF-0${prev.length + 35}`,
        name: name.trim(),
        role,
        department: dept,
        shift: "08:30–16:30",
        phone: "+91 98230 99001",
        salary: 32000,
        status: "Active",
      },
      ...prev,
    ]);
    setModalOpen(false);
    setName("");
    showToast("Non-teaching staff member added.");
  };

  return (
    <>
      <DataTablePage<StaffMember>
        role="admin"
        title="Non-Teaching Staff & Operations Directory"
        subtitle="42 Support Staff across Transport, Labs, Library, Security, and Administration"
        rows={staff}
        searchPlaceholder="Search staff name, EMP ID, department..."
        primaryAction={{ label: "Add Staff Member", onClick: () => setModalOpen(true) }}
        secondaryActions={[
          { label: "Staff Attendance", href: "/admin/staff/attendance" },
          { label: "Payroll", href: "/admin/staff/payroll" },
        ]}
        columns={[
          { id: "empId", header: "Emp ID", accessor: (r) => r.empId },
          { id: "name", header: "Staff Name", accessor: (r) => r.name },
          { id: "role", header: "Designation", accessor: (r) => r.role },
          { id: "dept", header: "Department", accessor: (r) => r.department },
          { id: "shift", header: "Shift Timing", accessor: (r) => r.shift },
          { id: "salary", header: "Salary", accessor: (r) => formatInr(r.salary) },
          {
            id: "status",
            header: "Status",
            accessor: (r) => r.status,
            badgeTone: (r) => (r.status === "Active" ? "success" : "warning"),
          },
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Non-Teaching Staff">
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <Input label="Staff Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Role / Designation" value={role} onChange={(e) => setRole(e.target.value)} />
          <Select
            label="Department"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            options={[
              { label: "Administration", value: "Administration" },
              { label: "Transport", value: "Transport" },
              { label: "Science Lab", value: "Science Lab" },
              { label: "Campus Safety", value: "Campus Safety" },
            ]}
          />
          <Button type="submit" variant="primary" className="w-full">
            Save Staff Member
          </Button>
        </form>
      </Modal>
    </>
  );
}

