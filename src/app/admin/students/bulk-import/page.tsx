"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, FileUpload, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  getBulkImportTemplateCsvAction,
  runBulkImportAction,
  type BulkImportResultDto,
} from "@/app/actions/onboarding.actions";

export default function BulkImportStudentsPage() {
  const { showToast } = useToast();
  const [entityType, setEntityType] = React.useState<"students" | "guardians" | "teachers" | "staff" | "fees">("students");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileLabel, setFileLabel] = React.useState("Choose a .csv or .xlsx roster spreadsheet");
  const [result, setResult] = React.useState<BulkImportResultDto | null>(null);
  const [busy, setBusy] = React.useState(false);

  const handleDownloadTemplate = async () => {
    const csv = await getBulkImportTemplateCsvAction(entityType);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entityType}_import_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${entityType}_import_template.csv`);
  };

  const executeBatch = async (mode: "dry_run" | "commit") => {
    if (!selectedFile) {
      showToast("Select a CSV or XLSX spreadsheet first.", "warning");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("entityType", entityType);
      fd.set("mode", mode);
      fd.set("file", selectedFile);

      const res = await runBulkImportAction(fd);
      if (!res.ok || !res.data) {
        showToast(res.error ?? "Bulk import failed.", "warning");
        return;
      }
      setResult(res.data);
      if (mode === "dry_run") {
        showToast(`Dry-run validated ${res.data.validCount} valid / ${res.data.errorCount} error rows.`);
      } else {
        showToast(`Imported ${res.data.createdCount + res.data.updatedCount} ${entityType} records into Supabase.`);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell
      role="admin"
      title="Bulk Import Students (CSV / Excel)"
      subtitle="Validate spreadsheet columns, preview format warnings, and import rosters up to 5,000+ rows in chunks"
    >
      <Card className="p-6 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="w-full lg:w-52">
            <Select
              label="Import Entity"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as typeof entityType)}
              options={[
                { label: "Students", value: "students" },
                { label: "Guardians", value: "guardians" },
                { label: "Teachers", value: "teachers" },
                { label: "Non-Teaching Staff", value: "staff" },
                { label: "Opening Fee Balances", value: "fees" },
              ]}
            />
          </div>
          <div className="flex-1">
            <FileUpload
              title={fileLabel}
              subtitle="CSV / XLSX up to 50 MB (supports 5,000+ rows)"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onFileSelected={(name, file) => {
                setFileLabel(name);
                setSelectedFile(file ?? null);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Button variant="outline" onClick={() => void handleDownloadTemplate()}>
              Download CSV Template
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => void executeBatch("dry_run")}>
              Dry-Run Validate
            </Button>
            <Button variant="primary" disabled={busy} onClick={() => void executeBatch("commit")}>
              {busy ? "Processing..." : "Commit Valid Rows"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            {result
              ? `Validation Preview (${result.validCount} Valid, ${result.errorCount} Errors out of ${result.totalRows})`
              : "Pre-Import Validation Preview"}
          </h2>
          <span className="text-xs text-ink-muted">
            {result ? `${result.preview.length} preview rows shown` : "Upload a CSV/XLSX to preview"}
          </span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="CSV validation preview">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Row</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Key / ID</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Name</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Detail</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Validation Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(result?.preview ?? []).map((r) => (
                <tr key={`${r.rowNum}-${r.key}`} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-bold text-ink">#{r.rowNum}</td>
                  <td className="py-3.5 px-4 text-sm font-mono text-ink">{r.key || "—"}</td>
                  <td className="py-3.5 px-4 text-sm font-medium text-ink">{r.label}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.detail}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={r.status === "Valid" ? "success" : "danger"}>
                      {r.error ?? "Valid"}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
              {!result ? (
                <tr>
                  <td colSpan={5} className="py-6 px-4 text-center text-xs text-ink-muted">
                    Download the template CSV above, add rows, and click Dry-Run Validate to inspect row-level validation.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
