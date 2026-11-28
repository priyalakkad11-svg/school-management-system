"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, ErrorState, Input, Select, Skeleton, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { SetupService } from "@/services/setup.service";
import type { Subject } from "@/types/domain";

export default function AdminSubjectsPage() {
  const { showToast } = useToast();
  const [saving, setSaving] = React.useState(false);

  const [editingId, setEditingId] = React.useState<string | undefined>();
  const [name, setName] = React.useState("Artificial Intelligence");
  const [code, setCode] = React.useState("AI-417");
  const [category, setCategory] = React.useState("Elective");
  const [maxTheory, setMaxTheory] = React.useState("50");
  const [maxPractical, setMaxPractical] = React.useState("50");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["setup-subjects"],
    queryFn: () => SetupService.listSubjects(),
  });

  const subjects = data?.ok && data.data ? data.data : [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setSaving(true);
    try {
      const res = await SetupService.upsertSubject({
        id: editingId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        category,
        maxTheory: Number(maxTheory) || 80,
        maxPractical: Number(maxPractical) || 20,
        periodsPerWeek: 4,
        status: "Active",
      });
      if (!res.ok) {
        showToast(res.error ?? "Unable to save subject.", "warning");
        return;
      }
      showToast(`Saved curriculum subject ${name} (${code.toUpperCase()}).`);
      setEditingId(undefined);
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sub: Subject) => {
    const res = await SetupService.deleteSubject(sub.id);
    if (!res.ok) {
      showToast(res.error ?? "Unable to remove subject.", "warning");
      return;
    }
    showToast(`Removed ${sub.code} from active catalog.`);
    if (editingId === sub.id) setEditingId(undefined);
    await refetch();
  };

  const handleSelectEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setName(sub.name);
    setCode(sub.code);
    setCategory(sub.category);
    setMaxTheory(String(sub.maxTheory));
    setMaxPractical(String(sub.maxPractical));
  };

  return (
    <AppShell
      role="admin"
      title="Subjects Catalog & Editor"
      subtitle="Define board subject codes, theory/practical weights, and elective categories"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-7 p-5 flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">All Curriculum Subjects</h2>
            <span className="text-xs text-ink-muted">{subjects.length} entries</span>
          </div>

          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : !data?.ok ? (
            <ErrorState
              description={data?.error ?? "Unable to load subjects catalog."}
              onRetry={() => void refetch()}
            />
          ) : (
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Curriculum subjects table">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-subtle border-b border-line">
                    <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Code</th>
                    <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Subject Name</th>
                    <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Type</th>
                    <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Status</th>
                    <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {subjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-subtle/60">
                      <td className="py-3 px-3 text-sm font-bold text-ink">{sub.code}</td>
                      <td className="py-3 px-3 text-sm text-ink">{sub.name}</td>
                      <td className="py-3 px-3">
                        <StatusBadge
                          tone={
                            sub.category === "Elective"
                              ? "warning"
                              : sub.category === "Theory + Lab"
                                ? "info"
                                : "primary"
                          }
                        >
                          {sub.category}
                        </StatusBadge>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge tone="success">{sub.status}</StatusBadge>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => handleSelectEdit(sub)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => void handleDelete(sub)}>
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-5 p-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">
                {editingId ? "Edit Subject" : "Add / Edit Subject"}
              </h2>
              {editingId ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(undefined);
                    setName("");
                    setCode("");
                  }}
                >
                  New
                </Button>
              ) : null}
            </div>
            <Input label="Subject Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Subject Code" value={code} onChange={(e) => setCode(e.target.value)} />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { label: "Elective", value: "Elective" },
                { label: "Core Theory", value: "Core Theory" },
                { label: "Theory + Lab", value: "Theory + Lab" },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Max Theory"
                type="number"
                value={maxTheory}
                onChange={(e) => setMaxTheory(e.target.value)}
              />
              <Input
                label="Max Practical"
                type="number"
                value={maxPractical}
                onChange={(e) => setMaxPractical(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Subject" : "Save Subject"}
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
