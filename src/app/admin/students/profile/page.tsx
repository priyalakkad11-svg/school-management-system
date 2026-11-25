"use client";

import Link from "next/link";
import { DetailPage } from "@/components/templates/DetailPage";
import { Button, Card } from "@/components/ui/primitives";
import { MOCK_STUDENTS } from "@/mocks/school.data";

export default function AdminStudentProfilePage() {
  const s = MOCK_STUDENTS[0];

  return (
    <DetailPage
      role="admin"
      title={`Student 360° Profile — ${s.name}`}
      subtitle="Unified academic, attendance, fee ledger, and verified document profile"
      entityName="Aarav Rajesh Sharma"
      entityInitials="AS"
      entityMeta={`${s.admissionId} • Class ${s.className}–${s.section} • Roll #${s.rollNo} • ${s.house} House • ${s.transportRoute}`}
      statusLabel={s.status}
      statusTone="success"
      backHref="/admin/students"
      headerActions={
        <Link href="/admin/students/id-cards">
          <Button variant="primary">Generate RFID ID Card</Button>
        </Link>
      }
      quickMetrics={[
        { label: "Attendance", value: `${s.attendancePct}%` },
        { label: "Term 1 Result", value: `${s.termAvgPct}% (A+)` },
        { label: "Fees Paid", value: "₹55,500" },
        { label: "Balance", value: "₹18,500 (Term 3)" },
      ]}
      tabs={[
        {
          key: "details",
          label: "Details",
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 flex flex-col gap-3">
                <h3 className="text-base font-bold text-ink">Verified Documents (4)</h3>
                <ul className="flex flex-col gap-2 text-sm text-ink-secondary">
                  <li>✓ Birth Certificate (Verified)</li>
                  <li>✓ Aadhaar / Student ID Proof</li>
                  <li>✓ Previous Class 9 Marksheet</li>
                  <li>✓ Medical Fitness Record</li>
                </ul>
              </Card>
              <Card className="p-6 flex flex-col gap-3">
                <h3 className="text-base font-bold text-ink">Attendance, Fees &amp; Academic Snapshot</h3>
                <ul className="flex flex-col gap-2 text-sm text-ink-secondary">
                  <li>Attendance: 138/143 days ({s.attendancePct}%)</li>
                  <li>Fees Paid: ₹55,500 • Balance: ₹18,500 (Term 3)</li>
                  <li>Term 1 Result: 458/500 ({s.termAvgPct}% • Grade A+)</li>
                  <li>Father: {s.parentName} ({s.parentPhone})</li>
                </ul>
              </Card>
            </div>
          ),
        },
        {
          key: "documents",
          label: "Documents",
          content: (
            <Card className="p-6">
              <h3 className="text-base font-bold text-ink pb-3">Uploaded Verification Archive</h3>
              <ul className="flex flex-col gap-2 text-sm text-ink-secondary">
                <li>Birth Certificate — Verified by Admissions Office on 02 Apr 2020</li>
                <li>Transfer Certificate — Original archived (#TC-2020-118)</li>
              </ul>
            </Card>
          ),
        },
        {
          key: "fees",
          label: "Fees (Paid)",
          content: (
            <Card className="p-6">
              <h3 className="text-base font-bold text-ink pb-3">AY 2026–27 Fee Ledger</h3>
              <p className="text-sm text-ink-secondary">
                Term 1 &amp; Term 2 cleared (RCP-2026-4410 • ₹18,500). Next installment Term 3 due
                10 Jan 2027.
              </p>
            </Card>
          ),
        },
      ]}
    />
  );
}

