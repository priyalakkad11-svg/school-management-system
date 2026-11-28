"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  listPlatformOpsDataAction,
  updateSupportTicketAction,
} from "@/app/actions/platform.actions";

type OpsData = Extract<
  Awaited<ReturnType<typeof listPlatformOpsDataAction>>,
  { ok: true }
>["data"];

export default function PlatformTicketsPage() {
  const { showToast } = useToast();
  const [data, setData] = React.useState<OpsData | null>(null);

  const load = React.useCallback(async () => {
    const res = await listPlatformOpsDataAction();
    if (res.ok) setData(res.data);
    else showToast(res.error, "warning");
  }, [showToast]);

  React.useEffect(() => {
    let active = true;
    void listPlatformOpsDataAction().then((res) => {
      if (!active) return;
      if (res.ok) setData(res.data);
      else showToast(res.error, "warning");
    });
    return () => {
      active = false;
    };
  }, [showToast]);

  return (
    <AppShell role="super_admin" title="Support Tickets" subtitle="Multi-school helpdesk escalations & resolution tracking">
      <Card className="p-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line text-ink-secondary">
              <th className="py-2 pr-3">School</th>
              <th className="py-2 pr-3">Subject</th>
              <th className="py-2 pr-3">Priority</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.tickets ?? []).map((t) => {
              const sch = Array.isArray(t.schools) ? t.schools[0] : t.schools;
              return (
                <tr key={t.id} className="border-b border-line last:border-0">
                  <td className="py-2.5 pr-3">{sch?.name ?? "School"} ({sch?.school_code ?? "—"})</td>
                  <td className="py-2.5 pr-3">
                    <strong className="block text-ink">{t.subject}</strong>
                    <span className="text-[11px] text-ink-secondary">{t.description}</span>
                  </td>
                  <td className="py-2.5 pr-3 uppercase">{t.priority}</td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge tone={t.status === "resolved" || t.status === "closed" ? "success" : "warning"}>
                      {t.status}
                    </StatusBadge>
                  </td>
                  <td className="py-2.5 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const r = await updateSupportTicketAction({
                          ticketId: t.id,
                          status: "resolved",
                          resolutionNotes: "Resolved by Platform Support Team",
                        });
                        if (r.ok) {
                          showToast("Ticket marked resolved.");
                          void load();
                        } else showToast(r.error ?? "Failed.", "warning");
                      }}
                    >
                      Mark Resolved
                    </Button>
                  </td>
                </tr>
              );
            })}
            {(data?.tickets.length ?? 0) === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-ink-muted">
                  No support tickets queued right now.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
