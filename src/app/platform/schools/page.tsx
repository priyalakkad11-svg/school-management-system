"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  listPlatformSchoolsAction,
  updateSchoolLifecycleAction,
  type PlatformSchoolListItem,
  type SchoolLifecycleStatus,
} from "@/app/actions/platform.actions";
import { formatInr } from "@/lib/saas-pricing";

export default function PlatformSchoolsPage() {
  const { showToast } = useToast();
  const [schools, setSchools] = React.useState<PlatformSchoolListItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await listPlatformSchoolsAction({ search, status });
    if (!res.ok || !res.data) {
      showToast(res.error ?? "Unable to load schools.", "warning");
    } else {
      setSchools(res.data);
    }
    setLoading(false);
  }, [search, status, showToast]);

  React.useEffect(() => {
    let active = true;
    void listPlatformSchoolsAction({ search, status }).then((res) => {
      if (!active) return;
      if (!res.ok || !res.data) {
        showToast(res.error ?? "Unable to load schools.", "warning");
      } else {
        setSchools(res.data);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [search, status, showToast]);

  const handleLifecycleChange = async (schoolId: string, nextStatus: SchoolLifecycleStatus) => {
    const res = await updateSchoolLifecycleAction({ schoolId, status: nextStatus });
    if (!res.ok) {
      showToast(res.error ?? "Status update failed.", "warning");
      return;
    }
    showToast(`School status updated to ${nextStatus}.`);
    void load();
  };

  return (
    <AppShell
      role="super_admin"
      title="Schools Directory"
      subtitle="Manage provisioned schools, lifecycle status, usage, and microsite URLs"
      actions={
        <Link href="/platform/schools/new">
          <Button size="sm">+ Create School</Button>
        </Link>
      }
    >
      <Card className="p-4 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-72">
          <Input
            label="Search Schools"
            placeholder="School name, code, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            label="Lifecycle Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Trial", value: "trial" },
              { label: "Active", value: "active" },
              { label: "Past Due", value: "past_due" },
              { label: "Read-Only", value: "read_only" },
              { label: "Suspended", value: "suspended" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />
        </div>
        <Button variant="outline" onClick={() => void load()}>
          Apply Filter
        </Button>
      </Card>

      <Card className="p-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line text-ink-secondary">
              <th className="py-2.5 pr-3 font-semibold">Code</th>
              <th className="py-2.5 pr-3 font-semibold">School</th>
              <th className="py-2.5 pr-3 font-semibold">Plan / Cycle</th>
              <th className="py-2.5 pr-3 font-semibold">Students / Limit</th>
              <th className="py-2.5 pr-3 font-semibold">MRR</th>
              <th className="py-2.5 pr-3 font-semibold">Status</th>
              <th className="py-2.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((s) => (
              <tr key={s.id} className="border-b border-line last:border-0">
                <td className="py-3 pr-3 font-mono font-bold text-ink">{s.schoolCode}</td>
                <td className="py-3 pr-3">
                  <div className="flex flex-col">
                    <Link href={`/platform/schools/${s.id}`} className="font-semibold text-brand hover:underline">
                      {s.name}
                    </Link>
                    <span className="text-[11px] text-ink-muted">
                      {s.board} · {s.contactEmail || "No email"}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-3 text-ink-secondary">
                  {s.planName} ({s.billingCycle})
                </td>
                <td className="py-3 pr-3 text-ink">
                  {s.studentsCount} / {s.maxStudents}
                </td>
                <td className="py-3 pr-3 font-semibold text-ink">
                  {s.isDemo ? "₹0 (Demo)" : formatInr(s.monthlyRateInr)}
                </td>
                <td className="py-3 pr-3">
                  <StatusBadge
                    tone={
                      s.status === "active"
                        ? "success"
                        : s.status === "trial"
                          ? "info"
                          : s.status === "past_due"
                            ? "warning"
                            : "danger"
                    }
                  >
                    {s.status}
                  </StatusBadge>
                </td>
                <td className="py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link href={`/s/${s.schoolCode}`} target="_blank">
                      <Button variant="ghost" size="sm">Microsite</Button>
                    </Link>
                    <Link href={`/platform/schools/${s.id}`}>
                      <Button variant="outline" size="sm">Manage</Button>
                    </Link>
                    {s.status !== "suspended" && !s.isDemo ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => void handleLifecycleChange(s.id, "suspended")}
                      >
                        Suspend
                      </Button>
                    ) : s.status === "suspended" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => void handleLifecycleChange(s.id, "active")}
                      >
                        Activate
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && schools.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ink-muted">
                  No schools match the current filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
