"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  generateBulkCredentialsAction,
  getRolloverContextAction,
  type GeneratedCredentialSlip,
} from "@/app/actions/onboarding.actions";

export default function BulkCredentialsPage() {
  const { showToast } = useToast();
  const [targetType, setTargetType] = React.useState<"student" | "teacher" | "staff">("student");
  const [classId, setClassId] = React.useState("");
  const [classes, setClasses] = React.useState<Array<{ id: string; name: string }>>([]);
  const [slips, setSlips] = React.useState<GeneratedCredentialSlip[]>([]);
  const [csvText, setCsvText] = React.useState("");
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    void getRolloverContextAction().then((res) => {
      if (active && res.ok && res.data) {
        setClasses(res.data.classes);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleGenerate = async () => {
    setRunning(true);
    try {
      const res = await generateBulkCredentialsAction({
        targetType,
        classId: targetType === "student" && classId ? classId : undefined,
      });
      if (!res.ok || !res.data) {
        showToast(res.error ?? "Credential generation failed.", "warning");
        return;
      }
      setSlips(res.data.slips);
      setCsvText(res.data.csvText);
      showToast(`Generated ${res.data.slips.length} one-time portal credentials.`);
    } finally {
      setRunning(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!csvText) return;
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `educore_${targetType}_credentials_onetime.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      role="admin"
      title="Bulk Portal Credential Generator"
      subtitle="Provision login accounts matching Admission / Employee numbers with printable slips & one-time CSV"
      actions={
        slips.length > 0 ? (
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handleDownloadCsv}>Download One-Time CSV</Button>
            <Button size="sm" onClick={() => window.print()}>Print Credential Slips</Button>
          </div>
        ) : undefined
      }
    >
      <Card className="p-5 flex flex-wrap items-end gap-4 print:hidden">
        <div className="w-full sm:w-52">
          <Select
            label="Target Group"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as typeof targetType)}
            options={[
              { label: "Unprovisioned Students", value: "student" },
              { label: "Unprovisioned Teachers", value: "teacher" },
              { label: "Unprovisioned Staff", value: "staff" },
            ]}
          />
        </div>
        {targetType === "student" ? (
          <div className="w-full sm:w-56">
            <Select
              label="Filter Class (Optional)"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              options={[
                { label: "All Classes", value: "" },
                ...classes.map((c) => ({ label: c.name, value: c.id })),
              ]}
            />
          </div>
        ) : null}
        <Button onClick={handleGenerate} disabled={running}>
          {running ? "Generating Accounts..." : "Generate Unprovisioned Credentials"}
        </Button>
      </Card>

      {slips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slips.map((s) => (
            <Card key={s.loginId} className="p-4 flex flex-col gap-1.5 border border-line">
              <div className="flex items-center justify-between">
                <strong className="text-sm text-ink">{s.fullName}</strong>
                <StatusBadge tone="primary">{s.classLabel}</StatusBadge>
              </div>
              <div className="text-xs text-ink-secondary">Login ID: <strong className="font-mono text-ink">{s.loginId}</strong></div>
              <div className="text-xs text-ink-secondary">Email: <span className="font-mono">{s.email}</span></div>
              <div className="text-xs bg-warning-soft px-2 py-1 rounded text-ink">
                Temp Password: <strong className="font-mono">{s.tempPassword}</strong>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-sm text-ink-secondary">
          Temporary passwords are shown once at creation time and never stored plaintext. Click
          Generate above to create Auth accounts for students, teachers, or staff without an
          existing login profile.
        </Card>
      )}
    </AppShell>
  );
}
