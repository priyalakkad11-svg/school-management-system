"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Checkbox, Input, Select, StatusBadge, Tabs } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  changeSchoolPlanAction,
  getSchoolDetailAction,
  listPlansAndCouponsAction,
  resetSchoolUserPasswordAction,
  startSupportSessionAction,
  toggleSchoolUserLockAction,
  updateSchoolLifecycleAction,
  updateSchoolModulesAction,
  type SaasPlanDto,
  type SchoolLifecycleStatus,
} from "@/app/actions/platform.actions";
import { formatInr } from "@/lib/saas-pricing";

const ALL_MODULES = [
  "setup",
  "students",
  "teachers",
  "staff",
  "attendance",
  "timetable",
  "exams",
  "fees",
  "library",
  "transport",
  "hostel",
  "communication",
  "reports",
  "inventory",
  "documents",
];

type DetailData = Extract<Awaited<ReturnType<typeof getSchoolDetailAction>>, { ok: true }>["data"];

export default function PlatformSchoolDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const schoolId = params.id;

  const [tab, setTab] = React.useState("overview");
  const [detail, setDetail] = React.useState<DetailData | null>(null);
  const [plans, setPlans] = React.useState<SaasPlanDto[]>([]);
  const [enabledModules, setEnabledModules] = React.useState<string[]>([]);
  const [newPlanId, setNewPlanId] = React.useState("");
  const [newCycle, setNewCycle] = React.useState<"monthly" | "yearly">("yearly");
  const [newTier, setNewTier] = React.useState(250);
  const [supportReason, setSupportReason] = React.useState("");
  const [supportReadOnly, setSupportReadOnly] = React.useState(true);
  const [resetResult, setResetResult] = React.useState<{ loginId: string; email: string; tempPassword: string } | null>(null);

  const load = React.useCallback(async () => {
    const [dRes, pRes] = await Promise.all([
      getSchoolDetailAction(schoolId),
      listPlansAndCouponsAction(),
    ]);
    if (!dRes.ok) {
      showToast(dRes.error, "warning");
      return;
    }
    setDetail(dRes.data);
    setEnabledModules(dRes.data.school.enabled_modules);
    if (dRes.data.subscription) {
      setNewPlanId(dRes.data.subscription.plan_id);
      setNewCycle(dRes.data.subscription.billing_cycle as "monthly" | "yearly");
      setNewTier(dRes.data.subscription.student_count_tier);
    }
    if (pRes.ok) setPlans(pRes.data.plans);
  }, [schoolId, showToast]);

  React.useEffect(() => {
    let active = true;
    void Promise.all([
      getSchoolDetailAction(schoolId),
      listPlansAndCouponsAction(),
    ]).then(([dRes, pRes]) => {
      if (!active) return;
      if (!dRes.ok) {
        showToast(dRes.error, "warning");
        return;
      }
      setDetail(dRes.data);
      setEnabledModules(dRes.data.school.enabled_modules);
      if (dRes.data.subscription) {
        setNewPlanId(dRes.data.subscription.plan_id);
        setNewCycle(dRes.data.subscription.billing_cycle as "monthly" | "yearly");
        setNewTier(dRes.data.subscription.student_count_tier);
      }
      if (pRes.ok) setPlans(pRes.data.plans);
    });
    return () => {
      active = false;
    };
  }, [schoolId, showToast]);

  if (!detail) {
    return (
      <AppShell role="super_admin" title="School Detail" subtitle="Loading school telemetry...">
        <Card className="p-6 text-sm text-ink-secondary">Loading school workspace details...</Card>
      </AppShell>
    );
  }

  const { school, subscription, usage, users, invoices, auditLogs, activeSupportSession } = detail;

  const handleSaveModules = async () => {
    const res = await updateSchoolModulesAction({ schoolId, enabledModules });
    if (!res.ok) showToast(res.error ?? "Failed.", "warning");
    else showToast("School module toggles saved.");
  };

  const handlePlanChange = async () => {
    const res = await changeSchoolPlanAction({
      schoolId,
      newPlanId,
      billingCycle: newCycle,
      studentCountTier: newTier,
    });
    if (!res.ok) {
      showToast(res.error ?? "Plan change failed.", "warning");
      return;
    }
    showToast(
      res.data?.invoiceNumber
        ? `Plan upgraded — Prorated Invoice ${res.data.invoiceNumber} generated.`
        : res.data?.creditNoteNumber
          ? `Plan downgraded — Credit Note ${res.data.creditNoteNumber} issued.`
          : "Subscription plan updated.",
    );
    void load();
  };

  const handleStartSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await startSupportSessionAction({
      schoolId,
      reason: supportReason,
      readOnly: supportReadOnly,
    });
    if (!res.ok || !res.data) {
      showToast(res.error ?? "Could not start support session.", "warning");
      return;
    }
    showToast("Audited support session started.");
    router.push(res.data.redirectTo);
    router.refresh();
  };

  return (
    <AppShell
      role="super_admin"
      title={`${school.name} (${school.school_code})`}
      subtitle={`${school.board} · Timezone ${school.timezone} · Microsite /s/${school.school_code}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href={`/s/${school.school_code}`} target="_blank">
            <Button variant="outline" size="sm">Open Public Microsite</Button>
          </Link>
        </div>
      }
    >
      <Tabs
        active={tab}
        onChange={setTab}
        items={[
          { key: "overview", label: "Overview" },
          { key: "usage", label: "Usage Metering" },
          { key: "billing", label: "Plan & Billing" },
          { key: "modules", label: "Modules / Features" },
          { key: "users", label: "Users & Reset" },
          { key: "audit", label: "Audit Logs" },
          { key: "support", label: "Support Access" },
        ]}
      />

      {tab === "overview" ? (
        <Card className="p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">{school.name}</h2>
              <p className="text-xs text-ink-secondary">{school.address || "No campus address"} · {school.contact_email} · {school.contact_phone}</p>
            </div>
            <StatusBadge tone={school.status === "active" ? "success" : school.status === "trial" ? "info" : "danger"}>
              {school.status}
            </StatusBadge>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["trial", "active", "past_due", "read_only", "suspended"] as SchoolLifecycleStatus[]).map((st) => (
              <Button
                key={st}
                size="sm"
                variant={school.status === st ? "primary" : "outline"}
                onClick={async () => {
                  const res = await updateSchoolLifecycleAction({ schoolId, status: st });
                  if (res.ok) {
                    showToast(`Lifecycle status changed to ${st}.`);
                    void load();
                  } else {
                    showToast(res.error ?? "Failed.", "warning");
                  }
                }}
              >
                Set {st}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}

      {tab === "usage" ? (
        <Card className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Quota & Usage Metering</h2>
            {usage.blocked100 ? (
              <StatusBadge tone="danger">100% Quota Reached — Upgrade Required</StatusBadge>
            ) : usage.warn80 ? (
              <StatusBadge tone="warning">80%+ Threshold Warning</StatusBadge>
            ) : (
              <StatusBadge tone="success">Healthy Capacity</StatusBadge>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <Card className="p-4">
              <span className="text-ink-secondary">Students</span>
              <strong className="block text-xl text-ink mt-1">{usage.studentsCount} / {usage.maxStudents}</strong>
            </Card>
            <Card className="p-4">
              <span className="text-ink-secondary">Teachers</span>
              <strong className="block text-xl text-ink mt-1">{usage.teachersCount} / {usage.maxTeachers}</strong>
            </Card>
            <Card className="p-4">
              <span className="text-ink-secondary">Staff</span>
              <strong className="block text-xl text-ink mt-1">{usage.staffCount} / {usage.maxStaff}</strong>
            </Card>
            <Card className="p-4">
              <span className="text-ink-secondary">Storage Used</span>
              <strong className="block text-xl text-ink mt-1">{usage.storageMb} MB / {usage.maxStorageMb} MB</strong>
            </Card>
          </div>
        </Card>
      ) : null}

      {tab === "billing" ? (
        <div className="flex flex-col gap-4">
          <Card className="p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-ink">Mid-Cycle Plan Change & Proration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Target SaaS Plan"
                value={newPlanId}
                onChange={(e) => setNewPlanId(e.target.value)}
                options={plans.map((p) => ({ label: p.name, value: p.id }))}
              />
              <Select
                label="Billing Cycle"
                value={newCycle}
                onChange={(e) => setNewCycle(e.target.value as "monthly" | "yearly")}
                options={[
                  { label: "Yearly", value: "yearly" },
                  { label: "Monthly", value: "monthly" },
                ]}
              />
              <Input
                label="Student Count Tier"
                type="number"
                value={String(newTier)}
                onChange={(e) => setNewTier(Number(e.target.value) || 100)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-secondary">
                Current MRR Equivalent: <strong>{formatInr(Number(subscription?.monthly_rate_inr ?? 0))}</strong>
              </span>
              <Button onClick={handlePlanChange}>Apply Plan Change (Auto Prorate / Credit Note)</Button>
            </div>
          </Card>

          <Card className="p-5 overflow-x-auto">
            <h3 className="text-sm font-bold text-ink mb-3">School Invoices</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-ink-secondary">
                  <th className="py-2 pr-3">Invoice #</th>
                  <th className="py-2 pr-3">Total (INR)</th>
                  <th className="py-2 pr-3">Paid</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right">Print</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-line last:border-0">
                    <td className="py-2 pr-3 font-mono font-semibold">{inv.invoice_number}</td>
                    <td className="py-2 pr-3">{formatInr(Number(inv.total_inr))}</td>
                    <td className="py-2 pr-3">{formatInr(Number(inv.amount_paid_inr))}</td>
                    <td className="py-2 pr-3"><StatusBadge tone={inv.status === "paid" ? "success" : "warning"}>{inv.status}</StatusBadge></td>
                    <td className="py-2 text-right">
                      <Link href={`/platform/invoices/${inv.id}/print`} className="text-brand font-semibold hover:underline">
                        GST Print View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      ) : null}

      {tab === "modules" ? (
        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-ink">Enabled School Modules</h2>
          <p className="text-xs text-ink-secondary">
            Controls sidebar navigation, Next.js middleware guards, and public microsite features for this school.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {ALL_MODULES.map((mod) => (
              <Checkbox
                key={mod}
                label={mod}
                checked={enabledModules.includes(mod)}
                onChange={(checked) =>
                  setEnabledModules((prev) =>
                    checked ? Array.from(new Set([...prev, mod])) : prev.filter((x) => x !== mod),
                  )
                }
              />
            ))}
          </div>
          <div>
            <Button onClick={handleSaveModules}>Save Module Feature Flags</Button>
          </div>
        </Card>
      ) : null}

      {tab === "users" ? (
        <div className="flex flex-col gap-4">
          {resetResult ? (
            <Card className="p-4 border-2 border-warning bg-warning-soft text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <strong>One-Time Reset Password for {resetResult.loginId} ({resetResult.email}):</strong>{" "}
                <span className="font-mono text-sm font-bold">{resetResult.tempPassword}</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setResetResult(null)}>Dismiss</Button>
            </Card>
          ) : null}

          <Card className="p-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-ink-secondary">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-3 font-mono">{u.user_code ?? "—"}</td>
                    <td className="py-2.5 pr-3 font-medium text-ink">{u.full_name} ({u.email})</td>
                    <td className="py-2.5 pr-3">{u.role}{u.sub_role ? ` (${u.sub_role})` : ""}</td>
                    <td className="py-2.5 pr-3"><StatusBadge tone={u.status === "Active" ? "success" : "danger"}>{u.status}</StatusBadge></td>
                    <td className="py-2.5 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const r = await resetSchoolUserPasswordAction({ userId: u.id });
                          if (!r.ok || !r.data) showToast(r.error ?? "Reset failed.", "warning");
                          else {
                            setResetResult(r.data);
                            showToast("Temporary password issued (forced change next login).");
                          }
                        }}
                      >
                        Reset Password
                      </Button>
                      <Button
                        size="sm"
                        variant={u.status === "Active" ? "danger" : "secondary"}
                        onClick={async () => {
                          const nextStatus = u.status === "Active" ? "Suspended" : "Active";
                          const r = await toggleSchoolUserLockAction({ userId: u.id, nextStatus });
                          if (r.ok) {
                            showToast(`Account ${nextStatus.toLowerCase()}.`);
                            void load();
                          } else {
                            showToast(r.error ?? "Action failed.", "warning");
                          }
                        }}
                      >
                        {u.status === "Active" ? "Lock" : "Unlock"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      ) : null}

      {tab === "audit" ? (
        <Card className="p-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-ink-secondary">
                <th className="py-2 pr-3">Timestamp</th>
                <th className="py-2 pr-3">Actor</th>
                <th className="py-2 pr-3">Module / Action</th>
                <th className="py-2">Table / Record</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="py-2 pr-3 text-ink-secondary">{new Date(a.created_at).toLocaleString("en-IN")}</td>
                  <td className="py-2 pr-3 font-medium text-ink">{a.actor_label}</td>
                  <td className="py-2 pr-3">{a.module} · {a.action}</td>
                  <td className="py-2 font-mono">{a.table_name} ({a.record_id ?? "—"})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}

      {tab === "support" ? (
        <Card className="p-6 flex flex-col gap-4 max-w-2xl">
          <h2 className="text-base font-bold text-ink">Screen 123 · Audited Support Access (&ldquo;View as School&rdquo;)</h2>
          <p className="text-xs text-ink-secondary">
            Starts a time-limited (60-minute) RLS-scoped support session logged into audit_logs.
            Read-only mode blocks all mutations at PostgreSQL RLS level.
          </p>
          {activeSupportSession ? (
            <StatusBadge tone="warning">
              Active Session Until {new Date(activeSupportSession.expires_at).toLocaleTimeString("en-IN")}
            </StatusBadge>
          ) : null}
          <form onSubmit={handleStartSupport} className="flex flex-col gap-4">
            <Input
              label="Audit Reason (logged permanently)"
              required
              value={supportReason}
              onChange={(e) => setSupportReason(e.target.value)}
              placeholder="Ticket #24: Investigating Class 10 fee slab rounding"
            />
            <Checkbox
              label="Read-Only Mode (Recommended — blocks writes at Postgres RLS)"
              checked={supportReadOnly}
              onChange={setSupportReadOnly}
            />
            <div>
              <Button type="submit">Start Support Access &amp; Open /admin</Button>
            </div>
          </form>
        </Card>
      ) : null}
    </AppShell>
  );
}
