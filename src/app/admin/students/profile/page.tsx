"use client";

import React from "react";
import Link from "next/link";
import { DetailPage } from "@/components/templates/DetailPage";
import { Button, Card } from "@/components/ui/primitives";
import { getLiveStudentsAction } from "@/app/actions/live-data.actions";
import type { Student } from "@/types/domain";

const EMPTY_STUDENT: Student = {
  id: "loading",
  admissionId: "ADM-2026-0142",
  rollNo: "01",
  name: "Loading Student...",
  className: "Class 10",
  section: "A",
  dob: "—",
  gender: "Male",
  bloodGroup: "O+",
  house: "Emerald",
  parentName: "Guardian",
  parentPhone: "—",
  parentEmail: "",
  address: "—",
  transportRoute: "Campus Bus",
  attendancePct: 95,
  termAvgPct: 90,
  feeStatus: "Paid",
  feeDueAmount: 0,
  status: "Active",
};

export default function AdminStudentProfilePage() {
  const [s, setS] = React.useState<Student>(EMPTY_STUDENT);

  React.useEffect(() => {
    let active = true;
    const admParam =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") : null;
    void getLiveStudentsAction().then((rows) => {
      if (!active || rows.length === 0) return;
      const match = admParam
        ? rows.find((r) => r.admissionId === admParam || r.id === admParam) ?? rows[0]
        : rows[0];
      setS(match);
    });
    return () => {
      active = false;
    };
  }, []);

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

