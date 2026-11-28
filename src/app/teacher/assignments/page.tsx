"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import type { StatusTone } from "@/types/domain";
import {
  createHomeworkAssignmentAction,
  listPortalAcademicDataAction,
} from "@/app/actions/academics-finance.actions";

interface HomeworkItem {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  submissions: string;
  status: "Active" | "Grading" | "Graded";
}

const STATUS_TONES: Record<HomeworkItem["status"], StatusTone> = {
  Active: "info",
  Grading: "warning",
  Graded: "success",
};

export default function TeacherAssignmentsPage() {
  const { showToast } = useToast();
  const [items, setItems] = React.useState<HomeworkItem[]>([]);
  const [classOptions, setClassOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [filterClass, setFilterClass] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [newTitle, setNewTitle] = React.useState("");
  const [newClassId, setNewClassId] = React.useState("");
  const [newDue, setNewDue] = React.useState("2026-12-05");
  const [saving, setSaving] = React.useState(false);

  const loadData = React.useCallback(async () => {
    const res = await listPortalAcademicDataAction();
    if (!res.ok || !res.data) return;
    const subCounts = new Map<string, number>();
    for (const s of res.data.submissions) {
      subCounts.set(s.assignment_id, (subCounts.get(s.assignment_id) ?? 0) + 1);
    }
    setClassOptions(res.data.classes.map((c) => ({ label: c.name, value: c.id })));
    setItems(
      res.data.homework.map((h) => {
        const clsObj = Array.isArray(h.school_classes) ? h.school_classes[0] : h.school_classes;
        const count = subCounts.get(h.id) ?? 0;
        const st: HomeworkItem["status"] =
          h.status === "Graded" ? "Graded" : count > 0 ? "Grading" : "Active";
        return {
          id: h.id,
          title: h.title,
          className: `${clsObj?.name ?? "Class"}–${h.section_name}`,
          dueDate: h.due_date,
          submissions: `${count} submitted`,
          status: st,
        };
      }),
    );
  }, []);

  React.useEffect(() => {
    let active = true;
    void listPortalAcademicDataAction().then((res) => {
      if (!active || !res.ok || !res.data) return;
      const subCounts = new Map<string, number>();
      for (const s of res.data.submissions) {
        subCounts.set(s.assignment_id, (subCounts.get(s.assignment_id) ?? 0) + 1);
      }
      const clsOpts = res.data.classes.map((c) => ({ label: c.name, value: c.id }));
      setClassOptions(clsOpts);
      if (clsOpts[0]) setNewClassId(clsOpts[0].value);
      setItems(
        res.data.homework.map((h) => {
          const clsObj = Array.isArray(h.school_classes) ? h.school_classes[0] : h.school_classes;
          const count = subCounts.get(h.id) ?? 0;
          const st: HomeworkItem["status"] =
            h.status === "Graded" ? "Graded" : count > 0 ? "Grading" : "Active";
          return {
            id: h.id,
            title: h.title,
            className: `${clsObj?.name ?? "Class"}–${h.section_name}`,
            dueDate: h.due_date,
            submissions: `${count} submitted`,
            status: st,
          };
        }),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = items.filter((i) => {
    if (filterClass !== "all" && !i.className.includes(filterClass)) return false;
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    return true;
  });

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast("Enter an assignment title.", "warning");
      return;
    }
    setSaving(true);
    const res = await createHomeworkAssignmentAction({
      classId: newClassId || undefined,
      title: newTitle.trim(),
      instructions: "Complete all questions in notebook or PDF.",
      dueDate: newDue,
    });
    setSaving(false);
    if (!res.ok) {
      showToast(res.error ?? "Unable to publish assignment.", "warning");
      return;
    }
    showToast(`Published "${newTitle.trim()}".`, "success");
    setNewTitle("");
    await loadData();
  };

  const classFilters = [
    { label: "All Classes", value: "all" },
    ...Array.from(new Set(items.map((i) => i.className))).map((c) => ({ label: c, value: c })),
  ];

  return (
    <AppShell
      role="teacher"
      title="Assignments & Submissions"
      subtitle="Create class assignments, inspect student uploads, and notify pending learners"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto">
          <Select
            label="Class"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            options={classFilters}
          />
          <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { label: "All Statuses", value: "all" },
              { label: "Active", value: "Active" },
              { label: "Grading", value: "Grading" },
              { label: "Graded", value: "Graded" },
            ]}
          />
        </div>
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Homework &amp; Submissions Tracker</h2>
          <span className="text-xs text-ink-muted">{filtered.length} records shown</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Assignments table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Title</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Class</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Due Date</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Submissions</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Resource</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-ink-muted">
                    No homework assignments published yet.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-subtle/60">
                    <td className="py-3.5 px-4 text-sm font-semibold text-ink">{item.title}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{item.className}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{item.dueDate}</td>
                    <td className="py-3.5 px-4 text-sm text-ink">{item.submissions}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge tone={STATUS_TONES[item.status]}>{item.status}</StatusBadge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link href="/teacher/study-material" className="text-xs font-semibold text-brand hover:underline">
                        Attach Study Material
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <form onSubmit={handlePublish} className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-ink">Publish New Homework Assignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <Input
                label="Assignment Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Coordinate Geometry Practice #5"
              />
            </div>
            <div className="md:col-span-3">
              <Select
                label="Target Class"
                value={newClassId}
                onChange={(e) => setNewClassId(e.target.value)}
                options={classOptions.length ? classOptions : [{ label: "Default Class", value: "" }]}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Due Date"
                type="date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" variant="primary" disabled={saving} className="w-full">
                {saving ? "Publishing..." : "Publish Homework"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}

