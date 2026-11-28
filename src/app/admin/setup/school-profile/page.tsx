"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, ErrorState, Input, Select, Skeleton, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { SetupService } from "@/services/setup.service";
import type { SchoolSettingsDto } from "@/app/actions/setup.actions";

function SchoolProfileForm({
  initial,
  onSaved,
}: {
  initial: SchoolSettingsDto;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [schoolName, setSchoolName] = React.useState(initial.schoolName);
  const [boardCode, setBoardCode] = React.useState(initial.affiliationCode);
  const [principal, setPrincipal] = React.useState(initial.principalName);
  const [email, setEmail] = React.useState(initial.officialEmail);
  const [phone, setPhone] = React.useState(initial.phone);
  const [timezone, setTimezone] = React.useState(initial.timezoneCurrency);
  const [address, setAddress] = React.useState(initial.address);
  const [grading, setGrading] = React.useState(initial.gradingMode);
  const [logoPath, setLogoPath] = React.useState<string | null>(initial.logoPath);
  const [logoSignedUrl, setLogoSignedUrl] = React.useState<string | null>(initial.logoSignedUrl);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await SetupService.saveSchoolSettings({
        schoolName,
        affiliationCode: boardCode,
        principalName: principal,
        officialEmail: email,
        phone,
        timezoneCurrency: timezone,
        address,
        gradingMode: grading,
      });
      if (!res.ok) {
        showToast(res.error ?? "Unable to save school settings.", "warning");
        return;
      }
      showToast(`Saved institutional settings for ${schoolName}.`);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const handleLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await SetupService.uploadSchoolLogo(fd);
      if (!res.ok || !res.data) {
        showToast(res.error ?? "Logo upload failed.", "warning");
        return;
      }
      setLogoPath(res.data.logoPath);
      setLogoSignedUrl(res.data.signedUrl);
      showToast("School crest uploaded to private storage.");
      onSaved();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <h2 className="text-lg font-bold text-ink">
          Institution Identity &amp; Regional Configuration
        </h2>
        {logoPath ? (
          <div className="flex items-center gap-2">
            <StatusBadge tone="success">Crest On File</StatusBadge>
            {logoSignedUrl ? (
              <a
                href={logoSignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-brand hover:underline"
              >
                View Crest
              </a>
            ) : null}
          </div>
        ) : (
          <StatusBadge tone="neutral">No Crest Uploaded</StatusBadge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="School Name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
        <Input label="Affiliation / Board Code" value={boardCode} onChange={(e) => setBoardCode(e.target.value)} />
        <Input label="Principal Name" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        <Input label="Official Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Campus Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Select
          label="Timezone & Currency"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          options={[
            { label: "IST (UTC+05:30) • INR (₹)", value: "IST (UTC+05:30) • INR (₹)" },
            { label: "UTC • USD ($)", value: "UTC • USD ($)" },
          ]}
        />
        <div className="md:col-span-2">
          <Input label="Campus Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <Select
          label="Grading Mode"
          value={grading}
          onChange={(e) => setGrading(e.target.value)}
          options={[
            { label: "CBSE 9-Point + Percentage", value: "CBSE 9-Point + Percentage" },
            { label: "IB 7-Point Criteria Scale", value: "IB 7-Point Criteria Scale" },
          ]}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        className="hidden"
        onChange={handleLogoSelected}
      />

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving Profile..." : "Save School Profile"}
        </Button>
        <Button
          variant="outline"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Uploading Crest..." : "Upload School Logo & Stamp"}
        </Button>
      </div>
    </form>
  );
}

export default function SchoolProfileSettingsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["setup-school-settings"],
    queryFn: () => SetupService.getSchoolSettings(),
  });

  return (
    <AppShell
      role="admin"
      title="School Profile & Institutional Settings"
      subtitle="Configure official affiliation metadata, timezone, currency, and grading scale"
    >
      <Card className="p-6 max-w-5xl">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-72" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !data?.ok || !data.data ? (
          <ErrorState
            description={data?.error ?? "Unable to load institutional settings."}
            onRetry={() => void refetch()}
          />
        ) : (
          <SchoolProfileForm
            key={data.data.id}
            initial={data.data}
            onSaved={() => void refetch()}
          />
        )}
      </Card>
    </AppShell>
  );
}
