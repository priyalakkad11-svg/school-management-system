"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { getLiveStudentsAction } from "@/app/actions/live-data.actions";
import type { Student } from "@/types/domain";

export default function StudentProfilePage() {
  const [student, setStudent] = React.useState<Student | null>(null);

  React.useEffect(() => {
    let active = true;
    void getLiveStudentsAction().then((rows) => {
      if (!active || rows.length === 0) return;
      setStudent(rows[0]);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell
      role="student"
      title="My Student Profile"
      subtitle="Verified admission record, guardian contacts, and digital RFID identity"
    >
      <Card className="p-6 flex flex-col gap-2">
        <span className="self-start">
          <StatusBadge tone="primary">
            {student
              ? `${student.admissionId} • ${student.className}–${student.section} • Roll #${student.rollNo}`
              : "Loading student record..."}
          </StatusBadge>
        </span>
        <h2 className="text-2xl font-bold text-ink pt-1">
          {student?.name ?? "Loading..."}
        </h2>
        <p className="text-sm text-ink-secondary">
          {student
            ? `House: ${student.house} • DOB: ${student.dob} • Blood Group: ${student.bloodGroup} • Status: ${student.status}`
            : "Fetching tenant student profile"}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col gap-3">
          <h3 className="text-base font-bold text-ink">Guardian &amp; Contact Info</h3>
          <ul className="flex flex-col gap-2.5 text-sm text-ink-secondary">
            <li>Primary Guardian: {student?.parentName ?? "—"} ({student?.parentPhone ?? "—"})</li>
            <li>Address: {student?.address ?? "—"}</li>
            <li>Guardian Email: {student?.parentEmail || "Registered on file"}</li>
          </ul>
        </Card>

        <Card className="p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-bold text-ink">Academic &amp; ID Documents</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-ink-secondary">
              <li>Attendance Standing: {student ? `${student.attendancePct}%` : "—"}</li>
              <li>Outstanding Fee Balance: {student ? `₹${student.feeDueAmount.toLocaleString("en-IN")}` : "—"}</li>
              <li>Digital ID Card: Active</li>
            </ul>
          </div>
          <div>
            <Button variant="outline" onClick={() => window.print()}>
              Print / Save Digital ID Card
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

