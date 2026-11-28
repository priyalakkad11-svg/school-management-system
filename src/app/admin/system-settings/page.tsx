"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Checkbox, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  exportSchoolComplianceArchiveAction,
  saveSystemSecurityPolicyAction,
} from "@/app/actions/academics-finance.actions";

export default function BackupSystemSettingsPage() {
  const { showToast } = useToast();
  const [backupSchedule, setBackupSchedule] = React.useState("Daily @ 02:00 AM IST");
  const [retention, setRetention] = React.useState("90 Days Encrypted");
  const [smsProvider, setSmsProvider] = React.useState("Twilio India + Meta WhatsApp Cloud");
  const [twoFaRequired, setTwoFaRequired] = React.useState(true);
  const [autoLockMarks, setAutoLockMarks] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await saveSystemSecurityPolicyAction({
      backupSchedule,
      retention,
      smsProvider,
      twoFaRequired,
      autoLockMarks,
    });
    setSaving(false);
    if (!res.ok) {
      showToast(res.error ?? "Unable to save system settings.", "warning");
      return;
    }
    showToast("Backup policy & security rules saved.", "success");
  };

  const handleBackup = async () => {
    setSaving(true);
    const res = await exportSchoolComplianceArchiveAction();
    setSaving(false);
    if (!res.ok || !res.data) {
      showToast(res.error ?? "Backup export failed.", "warning");
      return;
    }
    const blob = new Blob([res.data.json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `school-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded school data archive snapshot.", "success");
  };

  return (
    <AppShell
      role="admin"
      title="Backup, Security & System Settings"
      subtitle="Manage automated database snapshots, 2FA policy, and communication API gateways"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-7 p-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink border-b border-line pb-3">
              Platform Security &amp; Gateway Configuration
            </h2>
            <Select
              label="Automated Backup Schedule"
              value={backupSchedule}
              onChange={(e) => setBackupSchedule(e.target.value)}
              options={[
                { label: "Daily @ 02:00 AM IST", value: "Daily @ 02:00 AM IST" },
                { label: "Every 12 Hours", value: "Every 12 Hours" },
              ]}
            />
            <Input
              label="Snapshot Retention Policy"
              value={retention}
              onChange={(e) => setRetention(e.target.value)}
            />
            <Input
              label="SMS / WhatsApp Gateway"
              value={smsProvider}
              onChange={(e) => setSmsProvider(e.target.value)}
            />
            <Checkbox
              label="Require 2FA OTP for all Admin & Accountant logins"
              checked={twoFaRequired}
              onChange={setTwoFaRequired}
            />
            <Checkbox
              label="Auto-lock exam marksheet 48 hours after publication"
              checked={autoLockMarks}
              onChange={setAutoLockMarks}
            />
            <div className="pt-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving..." : "Save System Settings"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="lg:col-span-5 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Latest Cloud Snapshot</h2>
            <StatusBadge tone="success">Healthy</StatusBadge>
          </div>
          <p className="text-sm text-ink-secondary">
            Nightly encrypted snapshot &amp; tenant compliance JSON archive export on demand.
          </p>
          <Button variant="outline" disabled={saving} onClick={() => void handleBackup()}>
            Export Tenant Archive Now
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}

