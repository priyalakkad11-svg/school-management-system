"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { MOCK_LEAVES } from "@/mocks/school.data";
import type { LeaveRequest } from "@/types/domain";

export default function LeaveRequestsApprovalPage() {
  const { showToast } = useToast();
  const [leaves, setLeaves] = React.useState<LeaveRequest[]>(MOCK_LEAVES);

  const updateDecision = (id: string, status: "Approved" | "Rejected") => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    showToast(`Leave request marked ${status}.`);
  };

  return (
    <DataTablePage<LeaveRequest>
      role="admin"
      title="Leave Requests Approval Queue"
      subtitle="Review faculty, support staff, and student leave requests with substitute mapping"
      rows={leaves}
      searchPlaceholder="Search applicant, department, dates..."
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Pending", value: "Pending" },
            { label: "Approved", value: "Approved" },
            { label: "Rejected", value: "Rejected" },
          ],
          predicate: (row, val) => row.status === val,
        },
      ]}
      columns={[
        { id: "applicant", header: "Applicant", accessor: (r) => r.applicantName },
        { id: "role", header: "Role", accessor: (r) => r.applicantRole },
        { id: "dept", header: "Class / Dept", accessor: (r) => r.classOrDept },
        { id: "dates", header: "Dates", accessor: (r) => `${r.dates} (${r.days}d)` },
        { id: "sub", header: "Substitute", accessor: (r) => r.substitute ?? "—" },
        {
          id: "status",
          header: "Status",
          accessor: (r) => r.status,
          badgeTone: (r) =>
            r.status === "Approved" ? "success" : r.status === "Rejected" ? "danger" : "warning",
        },
      ]}
      rowActions={(r) =>
        r.status === "Pending" ? (
          <div className="inline-flex items-center gap-1.5">
            <Button size="sm" variant="primary" onClick={() => updateDecision(r.id, "Approved")}>
              Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => updateDecision(r.id, "Rejected")}>
              Reject
            </Button>
          </div>
        ) : null
      }
    />
  );
}

