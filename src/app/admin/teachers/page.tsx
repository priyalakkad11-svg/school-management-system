"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { getLiveTeachersAction } from "@/app/actions/live-data.actions";
import { formatInr } from "@/lib/utils";
import type { Teacher } from "@/types/domain";

export default function AdminTeachersListPage() {
  const [rows, setRows] = React.useState<Teacher[]>([]);
  React.useEffect(() => {
    let active = true;
    void getLiveTeachersAction().then((data) => {
      if (active) setRows(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DataTablePage<Teacher>
      role="admin"
      title="Teachers & Faculty Directory"
      subtitle={`${rows.length} Certified Educators loaded from database`}
      rows={rows}
      searchPlaceholder="Search teacher name, EMP ID, department..."
      primaryAction={{ label: "Add Teacher", href: "/admin/teachers/manage" }}
      secondaryActions={[
        { label: "Class Allocation", href: "/admin/teachers/assignments" },
        { label: "Leave Requests", href: "/admin/staff/leave-requests" },
      ]}
      filters={[
        {
          key: "dept",
          label: "Department",
          options: [
            { label: "Mathematics", value: "Mathematics" },
            { label: "Physics", value: "Physics" },
            { label: "English", value: "English" },
            { label: "Computer Science", value: "Computer Science" },
          ],
          predicate: (row, val) => row.department === val,
        },
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Active", value: "Active" },
            { label: "On Leave", value: "On Leave" },
          ],
          predicate: (row, val) => row.status === val,
        },
      ]}
      columns={[
        {
          id: "empId",
          header: "Emp ID",
          accessor: (r) => r.empId,
          href: () => "/admin/teachers/profile",
        },
        { id: "name", header: "Teacher Name", accessor: (r) => r.name },
        { id: "dept", header: "Department", accessor: (r) => r.department },
        { id: "classes", header: "Assigned Classes", accessor: (r) => r.classesAssigned },
        { id: "periods", header: "Load / Wk", accessor: (r) => `${r.periodsPerWeek} periods` },
        { id: "salary", header: "Gross Pay", accessor: (r) => formatInr(r.salaryGross) },
        {
          id: "status",
          header: "Status",
          accessor: (r) => r.status,
          badgeTone: (r) => (r.status === "Active" ? "success" : "warning"),
        },
      ]}
    />
  );
}

