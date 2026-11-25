"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { MOCK_COMPLAINTS } from "@/mocks/school.data";
import type { ComplaintTicket } from "@/types/domain";

export default function ComplaintsFeedbackPage() {
  const { showToast } = useToast();
  const [tickets, setTickets] = React.useState<ComplaintTicket[]>(MOCK_COMPLAINTS);

  const resolveTicket = (id: string) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Resolved" } : t)));
    showToast("Complaint ticket marked Resolved.");
  };

  return (
    <DataTablePage<ComplaintTicket>
      role="admin"
      title="Complaints & Parent Feedback Tracker"
      subtitle="Assign and resolve transport, canteen, and facility tickets raised by families"
      rows={tickets}
      searchPlaceholder="Search ticket no, subject, category..."
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Open", value: "Open" },
            { label: "In Progress", value: "In Progress" },
            { label: "Resolved", value: "Resolved" },
          ],
          predicate: (row, val) => row.status === val,
        },
      ]}
      columns={[
        { id: "ticketNo", header: "Ticket #", accessor: (r) => r.ticketNo },
        { id: "by", header: "Submitted By", accessor: (r) => r.submittedBy },
        { id: "cat", header: "Category", accessor: (r) => r.category },
        { id: "subject", header: "Subject", accessor: (r) => r.subject },
        { id: "assigned", header: "Owner", accessor: (r) => r.assignedTo },
        {
          id: "status",
          header: "Status",
          accessor: (r) => r.status,
          badgeTone: (r) =>
            r.status === "Resolved" ? "success" : r.status === "Open" ? "danger" : "warning",
        },
      ]}
      rowActions={(r) =>
        r.status !== "Resolved" ? (
          <Button size="sm" variant="primary" onClick={() => resolveTicket(r.id)}>
            Mark Resolved
          </Button>
        ) : null
      }
    />
  );
}

