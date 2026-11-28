"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { getLiveAuditLogsAction } from "@/app/actions/live-data.actions";
import type { AuditLogEntry } from "@/types/domain";

export default function AuditLogsPage() {
  const [rows, setRows] = React.useState<AuditLogEntry[]>([]);
  React.useEffect(() => {
    let active = true;
    void getLiveAuditLogsAction().then((data) => {
      if (active) setRows(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DataTablePage<AuditLogEntry>
      role="admin"
      title="Immutable System Audit Logs"
      subtitle="Chronological trace of fee edits, marks locks, attendance updates, and RBAC changes"
      rows={rows}
      searchPlaceholder="Search actor, module, IP, action..."
      columns={[
        { id: "ts", header: "Timestamp", accessor: (r) => r.timestamp },
        { id: "actor", header: "User / Actor", accessor: (r) => r.actor },
        { id: "module", header: "Module", accessor: (r) => r.module, badgeTone: () => "primary" },
        { id: "action", header: "Audit Action", accessor: (r) => r.action },
        { id: "ip", header: "IP Address", accessor: (r) => r.ip },
      ]}
    />
  );
}

