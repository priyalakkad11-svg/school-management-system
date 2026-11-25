"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const ACTIVE_ISSUES = [
  { id: "ci-1", accNo: "LIB-4421", book: "Concepts of Physics Vol. 2", member: "Aarav Sharma (10–A)", due: "02 Dec 2026", status: "Issued" },
  { id: "ci-2", accNo: "LIB-1189", book: "Mathematics Class 10 Reference", member: "Aarav Sharma (10–A)", due: "24 Nov 2026", status: "1d Overdue" },
];

export default function LibraryCirculationPage() {
  const { showToast } = useToast();
  const [issues, setIssues] = React.useState(ACTIVE_ISSUES);
  const [memberId, setMemberId] = React.useState("ADM-2026-0143 (Ananya Verma)");
  const [accNo, setAccNo] = React.useState("LIB-0923 (To Kill a Mockingbird)");

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIssues((prev) => [
      { id: `ci-${Date.now()}`, accNo: accNo.split(" ")[0], book: accNo, member: memberId, due: "09 Dec 2026", status: "Issued" },
      ...prev,
    ]);
    showToast(`Issued ${accNo} to ${memberId}.`);
  };

  return (
    <AppShell
      role="admin"
      title="Issue / Return Desk (Circulation)"
      subtitle="Scan student RFID cards and book barcodes for instant 14-day loan checkout"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-5 p-6">
          <form onSubmit={handleIssue} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink">Issue New Book</h2>
            <Input label="Student / Teacher ID" value={memberId} onChange={(e) => setMemberId(e.target.value)} />
            <Input label="Book Accession / Barcode" value={accNo} onChange={(e) => setAccNo(e.target.value)} />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Confirm Issue (14 Days)
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-7 p-5 flex flex-col gap-4">
          <h2 className="text-base font-bold text-ink">Active Book Loans</h2>
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Active book loans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle border-b border-line">
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Acc No</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Book Title</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Member</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Due</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {issues.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 px-3 text-sm font-bold text-ink">{row.accNo}</td>
                    <td className="py-3 px-3 text-sm text-ink">{row.book}</td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{row.member}</td>
                    <td className="py-3 px-3">
                      <StatusBadge tone={row.status.includes("Overdue") ? "danger" : "info"}>
                        {row.due}
                      </StatusBadge>
                    </td>
                    <td className="py-3 px-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIssues((prev) => prev.filter((i) => i.id !== row.id));
                          showToast(`Returned ${row.accNo}.`);
                        }}
                      >
                        Mark Returned
                      </Button>
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

