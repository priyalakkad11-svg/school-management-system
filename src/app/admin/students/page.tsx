"use client";

import { DataTablePage } from "@/components/templates/DataTablePage";
import { MOCK_STUDENTS } from "@/mocks/school.data";
import { formatInr } from "@/lib/utils";
import type { Student } from "@/types/domain";

export default function AdminStudentsListPage() {
  return (
    <DataTablePage<Student>
      role="admin"
      title="Students Directory"
      subtitle="Enrolled Students (2,480 across Nursery to Grade 12)"
      rows={MOCK_STUDENTS}
      searchPlaceholder="Name, Admission ID, Phone..."
      enableBulkSelect
      bulkActionLabel="Send Fee / Circular Alert"
      primaryAction={{ label: "Add Student", href: "/admin/students/new" }}
      secondaryActions={[
        { label: "Bulk Import", href: "/admin/students/bulk-import" },
        { label: "ID Cards", href: "/admin/students/id-cards" },
      ]}
      filters={[
        {
          key: "class",
          label: "Class",
          options: [{ label: "Class 10", value: "10" }],
          predicate: (row, val) => row.className === val,
        },
        {
          key: "section",
          label: "Section",
          options: [
            { label: "Section A", value: "A" },
            { label: "Section B", value: "B" },
          ],
          predicate: (row, val) => row.section === val,
        },
        {
          key: "fee",
          label: "Fee Status",
          options: [
            { label: "Paid", value: "Paid" },
            { label: "Due", value: "Due" },
            { label: "Overdue", value: "Overdue" },
          ],
          predicate: (row, val) => row.feeStatus === val,
        },
      ]}
      columns={[
        {
          id: "admId",
          header: "Admission ID",
          accessor: (r) => r.admissionId,
          href: (r) => `/admin/students/profile?id=${r.admissionId}`,
        },
        { id: "name", header: "Student Name", accessor: (r) => r.name },
        { id: "class", header: "Class", accessor: (r) => `${r.className}–${r.section}` },
        {
          id: "parent",
          header: "Parent Contact",
          accessor: (r) => `${r.parentName.replace(/^Mr\. |^Mrs\. /, "")} • ${r.parentPhone}`,
        },
        { id: "att", header: "Attendance", accessor: (r) => `${r.attendancePct}%` },
        {
          id: "fees",
          header: "Fees",
          accessor: (r) =>
            r.feeStatus === "Paid"
              ? "Paid"
              : r.feeDueAmount > 0
                ? `${formatInr(r.feeDueAmount)} Due`
                : r.feeStatus,
          badgeTone: (r) =>
            r.feeStatus === "Paid" ? "success" : r.feeStatus === "Due" ? "warning" : "danger",
        },
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

