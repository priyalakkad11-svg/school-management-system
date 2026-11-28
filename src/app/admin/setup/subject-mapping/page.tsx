"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, ErrorState, Select, Skeleton, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { SetupService } from "@/services/setup.service";
import type { SubjectMappingRowDto } from "@/app/actions/setup.actions";

export default function SubjectClassMappingPage() {
  const { showToast } = useToast();
  const [selectedYearId, setSelectedYearId] = React.useState<string | undefined>();
  const [selectedClassId, setSelectedClassId] = React.useState<string | undefined>();
  const [draftMapped, setDraftMapped] = React.useState<Record<string, boolean>>({});
  const [saving, setSaving] = React.useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["setup-subject-mapping", selectedYearId ?? "default", selectedClassId ?? "default"],
    queryFn: () =>
      SetupService.getSubjectMappingContext({
        academicYearId: selectedYearId,
        classId: selectedClassId,
      }),
  });

  const ctx = data?.ok ? data.data : undefined;
  const years = ctx?.academicYears ?? [];
  const classes = ctx?.classes ?? [];
  const yearId = ctx?.selectedYearId ?? "";
  const classId = ctx?.selectedClassId ?? "";

  const rows: SubjectMappingRowDto[] = React.useMemo(
    () =>
      (ctx?.rows ?? []).map((r) => ({
        ...r,
        mapped:
          `${yearId}:${classId}:${r.subjectId}` in draftMapped
            ? draftMapped[`${yearId}:${classId}:${r.subjectId}`]
            : r.mapped,
      })),
    [ctx, draftMapped, yearId, classId],
  );

  const toggleMapped = (subjectId: string, current: boolean) => {
    setDraftMapped((prev) => ({ ...prev, [`${yearId}:${classId}:${subjectId}`]: !current }));
  };

  const handleSave = async () => {
    if (!yearId || !classId) return;
    setSaving(true);
    try {
      const res = await SetupService.saveSubjectMappings({
        academicYearId: yearId,
        classId,
        items: rows.map((r) => ({
          subjectId: r.subjectId,
          periodsPerWeek: r.periodsPerWeek,
          isMandatory: r.isMandatory,
          mapped: r.mapped,
        })),
      });
      if (!res.ok) {
        showToast(res.error ?? "Unable to save mapping.", "warning");
        return;
      }
      const clsName = classes.find((c) => c.id === classId)?.name ?? "selected class";
      showToast(`Saved subject mapping for ${clsName}.`);
      setDraftMapped({});
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const activeClassName = classes.find((c) => c.id === classId)?.name ?? "Selected Class";

  return (
    <AppShell
      role="admin"
      title="Subject-to-Class Curriculum Mapping"
      subtitle="Assign mandatory and elective subjects to each grade for weekly timetable & exam scheduling"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
          <Select
            label="Select Class"
            value={classId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setDraftMapped({});
            }}
            options={classes.map((c) => ({ label: c.name, value: c.id }))}
          />
          <Select
            label="Academic Year"
            value={yearId}
            onChange={(e) => {
              setSelectedYearId(e.target.value);
              setDraftMapped({});
            }}
            options={years.map((y) => ({ label: y.name, value: y.id }))}
          />
        </div>
        <Button variant="primary" disabled={saving || isLoading} onClick={() => void handleSave()}>
          {saving ? "Saving Mapping..." : "Save Subject Mapping"}
        </Button>
      </div>

      <Card className="p-5 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Mapped Subjects for {activeClassName}</h2>
          <span className="text-xs text-ink-muted">{rows.length} entries</span>
        </div>

        {isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : !data?.ok ? (
          <ErrorState
            description={data?.error ?? "Unable to load curriculum mapping."}
            onRetry={() => void refetch()}
          />
        ) : (
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Subject class mapping table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle border-b border-line">
                  <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Subject</th>
                  <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Code</th>
                  <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Periods / Week</th>
                  <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Type</th>
                  <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Mandatory</th>
                  <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Mapped</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.subjectId} className="hover:bg-subtle/60">
                    <td className="py-3.5 px-4 text-sm font-semibold text-ink">{r.subject}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.code}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.periodsPerWeek} Periods</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{r.category}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">
                      {r.isMandatory ? "Yes" : "Optional"}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleMapped(r.subjectId, r.mapped)}
                        className="cursor-pointer rounded-full"
                      >
                        <StatusBadge tone={r.mapped ? (r.isMandatory ? "success" : "info") : "neutral"}>
                          {r.mapped ? "✓ Mapped" : "Unmapped"}
                        </StatusBadge>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
