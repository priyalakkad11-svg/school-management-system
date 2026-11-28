"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { submitHelpdeskTicketAction } from "@/app/actions/academics-finance.actions";

const HELP_GUIDES = [
  {
    q: "How to bulk import students via CSV?",
    a: "Navigate to Students → Bulk Import, download our Excel template, and map columns automatically.",
  },
  {
    q: "How to generate Term Report Cards?",
    a: "Go to Exams & Results → Result Generation, select Class & Exam, verify marks, and click Publish.",
  },
  {
    q: "Configuring WhatsApp & SMS Gateways",
    a: "Open Settings → Communication APIs to enter your Twilio or Meta Business Cloud API token.",
  },
];

const MODULE_OPTIONS = [
  { label: "Fees & Payment Gateway", value: "fees" },
  { label: "Students & Admissions", value: "students" },
  { label: "Exams & Report Cards", value: "exams" },
  { label: "Transport & RFID Attendance", value: "transport" },
];

const PRIORITY_OPTIONS = [
  { label: "High — Blocking Fee Collection", value: "high" },
  { label: "Medium — Workflow Question", value: "medium" },
  { label: "Low — Enhancement Request", value: "low" },
];

export default function HelpSupportPage() {
  const { showToast } = useToast();
  const [moduleName, setModuleName] = React.useState("fees");
  const [priority, setPriority] = React.useState("high");
  const [subject, setSubject] = React.useState("Razorpay webhook delay on UPI payments");
  const [description, setDescription] = React.useState("Receipt generation takes ~15s after payment...");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast("Please fill in subject and description.", "warning");
      return;
    }
    const res = await submitHelpdeskTicketAction({
      subject: subject.trim(),
      category: moduleName,
      priority: priority as "low" | "medium" | "high" | "urgent",
      description: description.trim(),
    });
    if (!res.ok) {
      showToast(res.error ?? "Unable to create support ticket.", "warning");
      return;
    }
    showToast("Support ticket logged to EduCore Support Queue.");
  };

  return (
    <AppShell
      role="common"
      title="Help Center & Support Tickets"
      subtitle="Browse ERP workflow guides or raise a priority ticket with EduCore IT Support"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-7 p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-ink">Frequently Asked Guides</h2>
          <div className="flex flex-col gap-3">
            {HELP_GUIDES.map((guide) => (
              <div key={guide.q} className="rounded-lg bg-subtle p-4 flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-ink">{guide.q}</h3>
                <p className="text-xs sm:text-sm text-ink-secondary">{guide.a}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-5 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink">Raise a Support Ticket</h2>
            <Select
              label="Module"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              options={MODULE_OPTIONS}
            />
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={PRIORITY_OPTIONS}
            />
            <Input
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Submit Support Ticket
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

