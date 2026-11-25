"use client";

import { DataTablePage } from "@/components/templates/DataTablePage";
import { MOCK_AUDIT_LOGS } from "@/mocks/school.data";
import type { AuditLogEntry } from "@/types/domain";

export default function AuditLogsPage() {
  return (
    <DataTablePage<AuditLogEntry>
      role="admin"
      title="Immutable System Audit Logs"
      subtitle="Chronological trace of fee edits, marks locks, attendance updates, and RBAC changes"
      rows={MOCK_AUDIT_LOGS}
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

