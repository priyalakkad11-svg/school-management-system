"use client";

import React from "react";
import { PrintView } from "@/components/templates/PrintView";
import { Select, StatusBadge } from "@/components/ui/primitives";

export default function DocumentsCertificateGeneratorPage() {
  const [docType, setDocType] = React.useState("Bonafide Student Certificate");
  const [studentName, setStudentName] = React.useState("Aarav Rajesh Sharma (ADM-2026-0142 • Class 10–A)");

  return (
    <PrintView
      role="admin"
      title="Documents & Certificate Generator"
      subtitle="Generate verified Bonafide Certificates, Transfer Certificates (TC), and Fee Declarations"
      documentHeading={docType.toUpperCase()}
      backHref="/admin/students"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
        <Select
          label="Certificate Template"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          options={[
            { label: "Bonafide Student Certificate", value: "Bonafide Student Certificate" },
            { label: "Transfer Certificate (TC)", value: "Transfer Certificate (TC)" },
            { label: "Character & Conduct Certificate", value: "Character & Conduct Certificate" },
            { label: "Annual Fee Tuition Certificate", value: "Annual Fee Tuition Certificate" },
          ]}
        />
        <Select
          label="Student Record"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          options={[
            { label: "Aarav Rajesh Sharma (ADM-2026-0142 • Class 10–A)", value: "Aarav Rajesh Sharma (ADM-2026-0142 • Class 10–A)" },
            { label: "Ananya Verma (ADM-2026-0143 • Class 10–A)", value: "Ananya Verma (ADM-2026-0143 • Class 10–A)" },
          ]}
        />
      </div>

      <div className="rounded-lg border border-line bg-subtle/40 p-6 flex flex-col gap-4 text-sm leading-relaxed">
        <div className="flex items-center justify-between">
          <span className="font-bold text-ink">Ref No: GIA/CERT/2026–27/0841</span>
          <StatusBadge tone="success">Digitally Signed &amp; Verified</StatusBadge>
        </div>
        <p className="text-ink">
          This is to certify that <strong>{studentName}</strong> is a bona fide regular student
          of <strong>Greenwood International Academy</strong> during Academic Year 2026–27. As per
          school admission records, their academic standing and conduct are exemplary.
        </p>
        <div className="pt-4 flex items-center justify-between text-xs text-ink-secondary">
          <span>Issued on: 25 Nov 2026</span>
          <span>Dr. Meenakshi Deshmukh • Principal</span>
        </div>
      </div>
    </PrintView>
  );
}

