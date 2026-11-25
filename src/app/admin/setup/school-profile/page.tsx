"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

export default function SchoolProfileSettingsPage() {
  const { showToast } = useToast();
  const [schoolName, setSchoolName] = React.useState("Greenwood International Academy");
  const [boardCode, setBoardCode] = React.useState("CBSE-1130492 • Est. 2004");
  const [principal, setPrincipal] = React.useState("Dr. Meenakshi Deshmukh");
  const [email, setEmail] = React.useState("office@greenwood.edu.in");
  const [phone, setPhone] = React.useState("+91 20 2748 9900");
  const [timezone, setTimezone] = React.useState("IST (UTC+05:30) • INR (₹)");
  const [address, setAddress] = React.useState("Plot 18, Knowledge Park, Baner Road, Pune 411045");
  const [grading, setGrading] = React.useState("CBSE 9-Point + Percentage");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Saved institutional settings for ${schoolName}.`);
  };

  return (
    <AppShell
      role="admin"
      title="School Profile & Institutional Settings"
      subtitle="Configure official affiliation metadata, timezone, currency, and grading scale"
    >
      <Card className="p-6 max-w-5xl">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-ink border-b border-line pb-3">
            Institution Identity &amp; Regional Configuration
          </h2>
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
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" variant="primary">
              Save School Profile
            </Button>
            <Button variant="outline" onClick={() => showToast("School crest & stamp dialog opened.")}>
              Upload School Logo &amp; Stamp
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}

