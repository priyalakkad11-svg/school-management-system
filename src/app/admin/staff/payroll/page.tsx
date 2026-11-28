"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { getLivePayrollAction } from "@/app/actions/live-data.actions";
import { formatInr } from "@/lib/utils";
import type { PayrollRecord } from "@/types/domain";

export default function PayrollSalaryListPage() {
  const [rows, setRows] = React.useState<PayrollRecord[]>([]);
  React.useEffect(() => {
    let active = true;
    void getLivePayrollAction().then((data) => {
      if (active) setRows(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DataTablePage<PayrollRecord>
      role="admin"
      title="Monthly Payroll & Salary Disbursement"
      subtitle="Salary Register with PF, TDS, Professional Tax, and Bank UTR"
      rows={rows}
      searchPlaceholder="Search employee ID, name, bank ref..."
      primaryAction={{ label: "Open Printable Salary Slip", href: "/admin/staff/salary-slip" }}
      columns={[
        {
          id: "empId",
          header: "Emp ID",
          accessor: (r) => r.empId,
          href: () => "/admin/staff/salary-slip",
        },
        { id: "name", header: "Employee Name", accessor: (r) => r.name },
        { id: "desg", header: "Designation", accessor: (r) => r.designation },
        { id: "gross", header: "Basic + HRA", accessor: (r) => formatInr(r.basic + r.hra + r.allowance) },
        { id: "deduct", header: "PF / TDS / PT", accessor: (r) => formatInr(r.pf + r.tds + r.pt) },
        { id: "net", header: "Net Pay", accessor: (r) => formatInr(r.netPay) },
        {
          id: "status",
          header: "Status",
          accessor: (r) => r.status,
          badgeTone: (r) => (r.status === "Processed" ? "success" : "warning"),
        },
      ]}
    />
  );
}

