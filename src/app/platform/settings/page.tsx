"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  listPlatformOpsDataAction,
  resetDemoSchoolAction,
  savePlatformSettingsAction,
} from "@/app/actions/platform.actions";

export default function PlatformSettingsPage() {
  const { showToast } = useToast();
  const [platformName, setPlatformName] = React.useState("EduCore Multi-School SaaS");
  const [ownerName, setOwnerName] = React.useState("Priya Lakkad");
  const [supportEmail, setSupportEmail] = React.useState("support@educore.in");
  const [companyName, setCompanyName] = React.useState("");
  const [companyAddress, setCompanyAddress] = React.useState("");
  const [gstin, setGstin] = React.useState("");
  const [trialDays, setTrialDays] = React.useState(14);
  const [graceDays, setGraceDays] = React.useState(7);
  const [gstPct, setGstPct] = React.useState(18);
  const [demoName, setDemoName] = React.useState("");

  React.useEffect(() => {
    void listPlatformOpsDataAction().then((res) => {
      if (!res.ok) {
        showToast(res.error, "warning");
        return;
      }
      if (res.data.settings) {
        const s = res.data.settings;
        setPlatformName(s.platform_name);
        setOwnerName(s.owner_name);
        setSupportEmail(s.support_email);
        setCompanyName(s.company_name);
        setCompanyAddress(s.company_address);
        setGstin(s.gstin);
        setTrialDays(s.default_trial_days);
        setGraceDays(s.default_grace_days);
        setGstPct(Number(s.default_gst_pct));
      }
      if (res.data.demoSchool) {
        setDemoName(res.data.demoSchool.name);
      }
    });
  }, [showToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await savePlatformSettingsAction({
      platformName,
      ownerName,
      supportEmail,
      companyName,
      companyAddress,
      gstin,
      defaultTrialDays: trialDays,
      defaultGraceDays: graceDays,
      defaultGstPct: gstPct,
    });
    if (res.ok) showToast("Platform billing & GST settings updated.");
    else showToast(res.error ?? "Save failed.", "warning");
  };

  const handleDemoReset = async () => {
    const res = await resetDemoSchoolAction();
    if (res.ok) showToast("Demo School (GIA01) restored cleanly to baseline.");
    else showToast(res.error ?? "Demo reset failed.", "warning");
  };

  return (
    <AppShell role="super_admin" title="Platform Settings & Demo School Manager" subtitle="GSTIN configuration, lifecycle defaults & showcase Demo School reset">
      <Card className="p-6 flex flex-col gap-4">
        <h2 className="text-base font-bold text-ink">GSTIN &amp; SaaS Platform Configuration</h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Platform Brand Name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          <Input label="Owner Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
          <Input label="Support Email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          <Input label="Legal Billing Entity" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          <Input label="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} />
          <Input label="Default GST %" type="number" value={String(gstPct)} onChange={(e) => setGstPct(Number(e.target.value) || 18)} />
          <Input label="Default Trial Days" type="number" value={String(trialDays)} onChange={(e) => setTrialDays(Number(e.target.value) || 14)} />
          <Input label="Default Grace Days" type="number" value={String(graceDays)} onChange={(e) => setGraceDays(Number(e.target.value) || 7)} />
          <Input label="Registered Office Address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
          <div className="md:col-span-3">
            <Button type="submit">Save Platform Configuration</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-ink">Showcase Demo School Manager</h2>
            <StatusBadge tone="info">is_demo = true · Excluded from MRR &amp; Usage</StatusBadge>
          </div>
          <p className="text-xs text-ink-secondary">
            Current Demo Sandbox: <strong>{demoName || "Greenwood International Academy (Demo)"}</strong> (GIA01). Safe to reset anytime for prospect demos.
          </p>
        </div>
        <Button variant="outline" onClick={handleDemoReset}>
          Reset Demo School Baseline
        </Button>
      </Card>
    </AppShell>
  );
}
