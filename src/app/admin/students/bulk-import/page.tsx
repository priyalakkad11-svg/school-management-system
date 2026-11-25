"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, FileUpload, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const PREVIEW_ROWS = [
  { row: "#01", name: "Aadhya Nair", cls: "6–A", phone: "+91 98111 22334", result: "Valid", tone: "success" as const },
  { row: "#02", name: "Vihaan Gupta", cls: "6–A", phone: "+91 98111 33445", result: "Valid", tone: "success" as const },
  { row: "#03", name: "Saanvi Deshmukh", cls: "7–B", phone: "98111 (Invalid)", result: "Phone Format Error", tone: "danger" as const },
  { row: "#04", name: "Reyansh Kapoor", cls: "8–C", phone: "+91 98111 55667", result: "Duplicate Admission ID", tone: "warning" as const },
];

export default function BulkImportStudentsPage() {
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = React.useState("class_6_to_9_admissions_batch2.xlsx (142 rows)");

  return (
    <AppShell
      role="admin"
      title="Bulk Import Students (CSV / Excel)"
      subtitle="Validate spreadsheet columns, preview format warnings, and import student rosters in bulk"
    >
      <Card className="p-6 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex-1">
            <FileUpload
              title={`Selected: ${selectedFile}`}
              subtitle="CSV / XLSX up to 50 MB"
              onFileSelected={(name) => setSelectedFile(name)}
            />
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Button
              variant="outline"
              onClick={() => showToast("Downloaded student_import_template.csv")}
            >
              Download CSV Template
            </Button>
            <Button
              variant="primary"
              onClick={() => showToast("Imported 139 valid student records (3 flagged rows skipped).")}
            >
              Validate &amp; Import 139 Valid Rows
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            Pre-Import Validation Preview (139 Valid, 3 Warnings)
          </h2>
          <span className="text-xs text-ink-muted">{PREVIEW_ROWS.length} sample entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="CSV validation preview">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Row</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Student Name</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Class</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Parent Phone</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Validation Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {PREVIEW_ROWS.map((r) => (
                <tr key={r.row} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-bold text-ink">{r.row}</td>
                  <td className="py-3.5 px-4 text-sm font-medium text-ink">{r.name}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.cls}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.phone}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={r.tone}>{r.result}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

