"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const INITIAL_REQUESTS = [
  { id: "pl-1", child: "Aarav (10–A)", dates: "19 Nov 2026", reason: "Family function", status: "Approved" as const },
  { id: "pl-2", child: "Diya (6–C)", dates: "04–05 Oct 2026", reason: "Viral fever (Doctor note)", status: "Approved" as const },
];

export default function ParentLeavePage() {
  const { showToast } = useToast();
  const [requests, setRequests] = React.useState<{ id: string; child: string; dates: string; reason: string; status: "Approved" | "Pending" }[]>(INITIAL_REQUESTS);
  const [child, setChild] = React.useState("Aarav (10–A)");
  const [leaveType, setLeaveType] = React.useState("Medical / Family Leave");
  const [dates, setDates] = React.useState("29 Nov 2026 – 30 Nov 2026");
  const [reason, setReason] = React.useState("Out-of-town family wedding");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dates.trim() || !reason.trim()) return;
    setRequests((prev) => [
      { id: `pl-${Date.now()}`, child, dates, reason: reason.trim(), status: "Pending" },
      ...prev,
    ]);
    showToast(`Leave request (${leaveType}) submitted for ${child}.`);
  };

  return (
    <AppShell
      role="parent"
      title="Apply Leave for Child"
      subtitle="Submit prior student leave intimations to the respective Class Teacher"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-5 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink">Request Student Leave</h2>
            <Select
              label="Select Child"
              value={child}
              onChange={(e) => setChild(e.target.value)}
              options={[
                { label: "Aarav Sharma (Class 10–A)", value: "Aarav (10–A)" },
                { label: "Diya Sharma (Class 6–C)", value: "Diya (6–C)" },
              ]}
            />
            <Select
              label="Leave Type"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              options={[
                { label: "Medical / Family Leave", value: "Medical / Family Leave" },
                { label: "Academic / Sports Representation", value: "Academic / Sports Representation" },
              ]}
            />
            <Input
              label="From – To Date"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
            />
            <Textarea
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Submit Leave Application
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-7 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Submitted Leave Requests</h2>
            <span className="text-xs text-ink-muted">{requests.length} entries</span>
          </div>

          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Submitted student leaves">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle border-b border-line">
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Child</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Dates</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Reason</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-subtle/60">
                    <td className="py-3 px-3 text-sm font-semibold text-ink">{r.child}</td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{r.dates}</td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{r.reason}</td>
                    <td className="py-3 px-3">
                      <StatusBadge tone={r.status === "Approved" ? "success" : "warning"}>
                        {r.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
