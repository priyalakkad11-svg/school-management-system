"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  createPlatformAnnouncementAction,
  listPlatformOpsDataAction,
} from "@/app/actions/platform.actions";

type OpsData = Extract<
  Awaited<ReturnType<typeof listPlatformOpsDataAction>>,
  { ok: true }
>["data"];

export default function PlatformAnnouncementsPage() {
  const { showToast } = useToast();
  const [data, setData] = React.useState<OpsData | null>(null);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [severity, setSeverity] = React.useState<"info" | "warning" | "critical">("info");

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

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createPlatformAnnouncementAction({ title, body, severity });
    if (!res.ok) {
      showToast(res.error ?? "Failed publishing.", "warning");
      return;
    }
    showToast("Platform announcement published.");
    setTitle("");
    setBody("");
    void load();
  };

  return (
    <AppShell role="super_admin" title="Platform Announcements" subtitle="Broadcast maintenance windows, release notes & GST policy updates to schools">
      <Card className="p-5 flex flex-col gap-4">
        <h2 className="text-base font-bold text-ink">Publish Broadcast Announcement</h2>
        <form onSubmit={handlePublish} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Scheduled CBSE Results Export Enhancement" />
            </div>
            <Select
              label="Severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as typeof severity)}
              options={[
                { label: "Info", value: "info" },
                { label: "Warning", value: "warning" },
                { label: "Critical", value: "critical" },
              ]}
            />
          </div>
          <Textarea label="Announcement Body" required value={body} onChange={(e) => setBody(e.target.value)} placeholder="Details visible to school administrators..." />
          <div>
            <Button type="submit">Publish Announcement</Button>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {(data?.announcements ?? []).map((a) => (
          <Card key={a.id} className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-sm text-ink">{a.title}</strong>
              <StatusBadge tone={a.severity === "critical" ? "danger" : a.severity === "warning" ? "warning" : "info"}>
                {a.severity}
              </StatusBadge>
            </div>
            <p className="text-xs text-ink-secondary">{a.body}</p>
            <span className="text-[11px] text-ink-muted">{new Date(a.published_at).toLocaleString("en-IN")}</span>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
