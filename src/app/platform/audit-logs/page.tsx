"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { listPlatformOpsDataAction } from "@/app/actions/platform.actions";

type OpsData = Extract<
  Awaited<ReturnType<typeof listPlatformOpsDataAction>>,
  { ok: true }
>["data"];

export default function PlatformAuditLogsPage() {
  const { showToast } = useToast();
  const [data, setData] = React.useState<OpsData | null>(null);

  React.useEffect(() => {
    void listPlatformOpsDataAction().then((res) => {
      if (res.ok) setData(res.data);
      else showToast(res.error, "warning");
    });
  }, [showToast]);

  return (
    <AppShell role="super_admin" title="Platform Audit Logs" subtitle="Immutable cross-tenant compliance, support access & mutation log">
      <Card className="p-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line text-ink-secondary">
              <th className="py-2 pr-3">Timestamp</th>
              <th className="py-2 pr-3">School</th>
              <th className="py-2 pr-3">Actor</th>
              <th className="py-2 pr-3">Module / Action</th>
              <th className="py-2">Table / Record</th>
            </tr>
          </thead>
          <tbody>
            {(data?.auditLogs ?? []).map((a) => {
              const sch = Array.isArray(a.schools) ? a.schools[0] : a.schools;
              return (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="py-2 pr-3 text-ink-secondary">{new Date(a.created_at).toLocaleString("en-IN")}</td>
                  <td className="py-2 pr-3 font-mono">{sch?.school_code ?? "—"}</td>
                  <td className="py-2 pr-3 font-medium text-ink">{a.actor_label}</td>
                  <td className="py-2 pr-3">{a.module} · {a.action}</td>
                  <td className="py-2 font-mono">{a.table_name} ({a.record_id ?? "—"})</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
