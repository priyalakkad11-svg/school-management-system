"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { MOCK_LEAVES } from "@/mocks/school.data";
import type { LeaveRequest } from "@/types/domain";

export default function TeacherLeavePage() {
  const { showToast } = useToast();
  const [history, setHistory] = React.useState<LeaveRequest[]>(MOCK_LEAVES);
  const [leaveType, setLeaveType] = React.useState("Medical");
  const [fromDate, setFromDate] = React.useState("2026-11-27");
  const [toDate, setToDate] = React.useState("2026-11-28");
  const [substitute, setSubstitute] = React.useState("Mr. Rohan Deshmukh (Math)");
  const [reason, setReason] = React.useState("Scheduled dental surgery & recovery");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setHistory((prev) => [
      {
        id: `lv-${Date.now()}`,
        applicantName: "Mrs. Kavita Nair",
        applicantRole: "Teacher",
        classOrDept: "Mathematics",
        leaveType,
        dates: `${fromDate} to ${toDate}`,
        days: 2,
        substitute,
        reason: reason.trim(),
        status: "Pending",
      },
      ...prev,
    ]);
    showToast("Leave request submitted for Principal review.");
  };

  return (
    <AppShell
      role="teacher"
      title="Leave Application & History"
      subtitle="Submit faculty leave applications with suggested substitute coverage"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-5 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink">Apply for Leave</h2>
            <Select
              label="Leave Type"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              options={[
                { label: "Medical Leave (6 days left)", value: "Medical" },
                { label: "Casual Leave (5 days left)", value: "Casual" },
                { label: "Earned Leave", value: "Earned" },
              ]}
            />
            <Input
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <Input
              label="Substitute Suggested"
              value={substitute}
              onChange={(e) => setSubstitute(e.target.value)}
            />
            <Textarea
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Submit Leave Request
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-7 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">My Leave History (AY 2026–27)</h2>
            <span className="text-xs text-ink-muted">{history.length} records shown</span>
          </div>

          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="My leave history">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle border-b border-line">
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Dates</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Type</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Days</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Substitute</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-subtle/60">
                    <td className="py-3 px-3 text-sm font-semibold text-ink">{item.dates}</td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{item.leaveType}</td>
                    <td className="py-3 px-3 text-sm text-ink">{item.days}</td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{item.substitute ?? "—"}</td>
                    <td className="py-3 px-3">
                      <StatusBadge
                        tone={
                          item.status === "Approved"
                            ? "success"
                            : item.status === "Rejected"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {item.status}
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

