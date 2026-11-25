"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { MOCK_SUBJECTS } from "@/mocks/school.data";
import type { Subject } from "@/types/domain";

export default function AdminSubjectsPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = React.useState<Subject[]>(MOCK_SUBJECTS);
  const [name, setName] = React.useState("Artificial Intelligence");
  const [code, setCode] = React.useState("AI-417");
  const [category, setCategory] = React.useState("Skill Elective (Theory + Practical)");
  const [marksSplit, setMarksSplit] = React.useState("50 Theory + 50 Practical");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setSubjects((prev) => [
      {
        id: `sub-${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category: category.includes("Elective") ? "Elective" : category,
        maxTheory: 50,
        maxPractical: 50,
        periodsPerWeek: 4,
        status: "Active",
      },
      ...prev,
    ]);
    showToast(`Saved curriculum subject ${name} (${code}).`);
  };

  return (
    <AppShell
      role="admin"
      title="Subjects Catalog & Editor"
      subtitle="Define board subject codes, theory/practical weights, and elective categories"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-7 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">All Curriculum Subjects (28)</h2>
            <span className="text-xs text-ink-muted">{subjects.length} entries</span>
          </div>

          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Curriculum subjects table">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle border-b border-line">
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Code</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Subject Name</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Type</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Status</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-5 p-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink">Add / Edit Subject</h2>
            <Input label="Subject Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Subject Code" value={code} onChange={(e) => setCode(e.target.value)} />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { label: "Skill Elective (Theory + Practical)", value: "Skill Elective (Theory + Practical)" },
                { label: "Core Theory", value: "Core Theory" },
                { label: "Theory + Lab", value: "Theory + Lab" },
              ]}
            />
            <Input
              label="Max Theory / Practical Marks"
              value={marksSplit}
              onChange={(e) => setMarksSplit(e.target.value)}
            />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Save Subject
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

