"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar, Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { MOCK_STUDENTS } from "@/mocks/school.data";

export default function StudentIdCardGeneratorPage() {
  const [cls, setCls] = React.useState("Class 10–A (40 Students)");
  const [template, setTemplate] = React.useState("Vertical Smart RFID Card");

  return (
    <AppShell
      role="admin"
      title="Student ID Card Generator"
      subtitle="Generate printable batch RFID Smart Identity Cards per section"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
          <Select
            label="Class & Section"
            value={cls}
            onChange={(e) => setCls(e.target.value)}
            options={[
              { label: "Class 10–A (40 Students)", value: "Class 10–A (40 Students)" },
              { label: "Class 10–B (38 Students)", value: "Class 10–B (38 Students)" },
            ]}
          />
          <Select
            label="Template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            options={[
              { label: "Vertical Smart RFID Card", value: "Vertical Smart RFID Card" },
              { label: "Horizontal Lanyard Badge", value: "Horizontal Lanyard Badge" },
            ]}
          />
        </div>
        <Button variant="primary" onClick={() => window.print()}>
          Generate Batch PDF (40 Cards)
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_STUDENTS.slice(0, 4).map((student) => {
          const initials = student.name
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2);
          return (
            <Card key={student.id} className="overflow-hidden flex flex-col">
              <div className="bg-brand text-ink-on-dark px-4 py-4 text-center">
                <div className="text-xs font-bold tracking-wide">GREENWOOD ACADEMY</div>
                <div className="text-[11px] opacity-90 pt-0.5">STUDENT IDENTITY CARD 2026–27</div>
              </div>
              <div className="p-5 flex flex-col items-center text-center gap-2.5">
                <Avatar initials={initials} size="lg" />
                <div className="text-base font-bold text-ink pt-1">{student.name}</div>
                <StatusBadge tone="primary">{student.admissionId}</StatusBadge>
                <div className="text-xs font-medium text-ink-secondary">
                  Class {student.className}–{student.section} • Roll #{student.rollNo}
                </div>
                <div className="text-[11px] text-ink-muted">
                  Blood: {student.bloodGroup} • {student.transportRoute}
                </div>
                <div className="tracking-widest text-xs font-bold text-ink pt-1" aria-hidden="true">
                  |||| || |||| ||| |||| ||| ||||
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

