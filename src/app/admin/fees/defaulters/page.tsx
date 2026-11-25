"use client";

import { DataTablePage } from "@/components/templates/DataTablePage";
import { MOCK_FEE_TRANSACTIONS } from "@/mocks/school.data";
import { formatInr } from "@/lib/utils";
import type { FeeTransaction } from "@/types/domain";

export default function FeeDefaultersPage() {
  const defaulters = MOCK_FEE_TRANSACTIONS.filter((f) => f.status !== "Paid");

  return (
    <DataTablePage<FeeTransaction>
      role="admin"
      title="Pending Dues & Defaulters List"
      subtitle="Send bulk WhatsApp & SMS fee reminder links to families with pending invoices"
      rows={defaulters}
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

