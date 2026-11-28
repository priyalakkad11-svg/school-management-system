"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { listPortalAcademicDataAction, requestStudentLeaveAction } from "@/app/actions/academics-finance.actions";

interface LeaveRow {
  id: string;
  child: string;
  dates: string;
  reason: string;
  status: string;
}

export default function ParentLeavePage() {
  const { showToast } = useToast();
  const [requests, setRequests] = React.useState<LeaveRow[]>([]);
  const [childOptions, setChildOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [selectedChild, setSelectedChild] = React.useState("");
  const [fromDate, setFromDate] = React.useState("2026-12-02");
  const [toDate, setToDate] = React.useState("2026-12-03");
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const reload = React.useCallback(async () => {
    const res = await listPortalAcademicDataAction();
    if (!res.ok || !res.data) return;
    setChildOptions(
      res.data.students.slice(0, 6).map((s) => ({
        label: `${s.full_name} (${s.section_name})`,
        value: s.id,
      })),
    );
    setRequests(
      res.data.leaves.map((l) => {
        const stu = Array.isArray(l.students) ? l.students[0] : l.students;
        return {
          id: l.id,
          child: stu?.full_name ?? "Student",
          dates: `${l.from_date} – ${l.to_date}`,
          reason: l.reason,
          status: l.status,
        };
      }),
    );
  }, []);

  React.useEffect(() => {
    let active = true;
    void listPortalAcademicDataAction().then((res) => {
      if (!active || !res.ok || !res.data) return;
      const cOpts = res.data.students.slice(0, 6).map((s) => ({
        label: `${s.full_name} (${s.section_name})`,
        value: s.id,
      }));
      setChildOptions(cOpts);
      if (cOpts[0]) setSelectedChild(cOpts[0].value);
      setRequests(
        res.data.leaves.map((l) => {
          const stu = Array.isArray(l.students) ? l.students[0] : l.students;
          return {
            id: l.id,
            child: stu?.full_name ?? "Student",
            dates: `${l.from_date} – ${l.to_date}`,
            reason: l.reason,
            status: l.status,
          };
        }),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason.trim()) {
      showToast("Provide from/to dates and leave reason.", "warning");
      return;
    }
    setSubmitting(true);
    const res = await requestStudentLeaveAction({ fromDate, toDate, reason: reason.trim() });
    setSubmitting(false);
    if (!res.ok) {
      showToast(res.error ?? "Unable to submit leave application.", "warning");
      return;
    }
    showToast("Leave request submitted to class teacher.", "success");
    setReason("");
    await reload();
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
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              options={childOptions.length ? childOptions : [{ label: "Loading...", value: "" }]}
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
            <Textarea
              label="Reason"
              placeholder="Medical checkup, family travel..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit Leave Application"}
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
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-ink-muted">
                      No leave applications submitted yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

