"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { getLiveFeeTransactionsAction } from "@/app/actions/live-data.actions";
import { formatInr } from "@/lib/utils";
import type { FeeTransaction } from "@/types/domain";

export default function FeeDefaultersPage() {
  const [rows, setRows] = React.useState<FeeTransaction[]>([]);
  React.useEffect(() => {
    let active = true;
    void getLiveFeeTransactionsAction().then((data) => {
      if (active) setRows(data.filter((f) => f.status !== "Paid"));
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DataTablePage<FeeTransaction>
      role="admin"
      title="Pending Dues & Defaulters List"
      subtitle="Send bulk WhatsApp & SMS fee reminder links to families with pending invoices"
      rows={rows}
      searchPlaceholder="Search student, invoice ID..."
      enableBulkSelect
      bulkActionLabel="Send Payment Reminder SMS"
      primaryAction={{ label: "Collect Counter Payment", href: "/admin/fees/collect" }}
      columns={[
        { id: "receipt", header: "Invoice Ref", accessor: (r) => r.receiptNo },
        { id: "student", header: "Student Name", accessor: (r) => r.studentName },
        { id: "cls", header: "Class", accessor: (r) => r.className },
        { id: "head", header: "Fee Head", accessor: (r) => r.feeHead },
        { id: "amt", header: "Amount Due", accessor: (r) => formatInr(r.amount) },
        {
          id: "status",
          header: "Status",
          accessor: (r) => r.status,
          badgeTone: (r) => (r.status === "Overdue" ? "danger" : "warning"),
        },
      ]}
    />
  );
}

