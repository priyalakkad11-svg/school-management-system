"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import type { StatusTone } from "@/types/domain";

interface HomeworkItem {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  submissions: string;
  status: "Active" | "Grading" | "Graded";
  actionLabel: string;
}

const INITIAL_HOMEWORK: HomeworkItem[] = [
  {
    id: "hw-1",
    title: "Quadratic Equations Problem Set #4",
    className: "10–A",
    dueDate: "28 Nov 2026",
    submissions: "34 / 40",
    status: "Active",
    actionLabel: "View Submissions",
  },
  {
    id: "hw-2",
    title: "Trigonometry Identities Worksheet",
    className: "10–C",
    dueDate: "24 Nov 2026",
    submissions: "38 / 38",
    status: "Grading",
    actionLabel: "Grade Now",
  },
  {
    id: "hw-3",
    title: "Definite Integrals Lab Manual",
    className: "12–Sci",
    dueDate: "20 Nov 2026",
    submissions: "32 / 32",
    status: "Graded",
    actionLabel: "View Scores",
  },
  {
    id: "hw-4",
    title: "Linear Graphs Practice Sheet",
    className: "9–B",
    dueDate: "30 Nov 2026",
    submissions: "19 / 36",
    status: "Active",
    actionLabel: "Remind Pending",
  },
];

const STATUS_TONES: Record<HomeworkItem["status"], StatusTone> = {
  Active: "info",
  Grading: "warning",
  Graded: "success",
};

export default function TeacherAssignmentsPage() {
  const { showToast } = useToast();
  const [items, setItems] = React.useState<HomeworkItem[]>(INITIAL_HOMEWORK);
  const [filterClass, setFilterClass] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [newTitle, setNewTitle] = React.useState("Coordinate Geometry Practice #5");
  const [newClass, setNewClass] = React.useState("10–A & 10–C");
  const [newDue, setNewDue] = React.useState("02 Dec 2026");

  const filtered = React.useMemo(
    () =>
      items.filter((i) => {
        if (filterClass !== "all" && !i.className.includes(filterClass)) return false;
        if (filterStatus !== "all" && i.status !== filterStatus) return false;
        return true;
      }),
    [items, filterClass, filterStatus],
  );

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setItems((prev) => [
      {
        id: `hw-${Date.now()}`,
        title: newTitle.trim(),
        className: newClass,
        dueDate: newDue,
        submissions: "0 / 40",
        status: "Active",
        actionLabel: "View Submissions",
      },
      ...prev,
    ]);
    showToast(`Published "${newTitle}" to ${newClass}.`);
    setNewTitle("");
  };

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
            options={[
              { label: "All Classes", value: "all" },
              { label: "Class 10–A", value: "10–A" },
              { label: "Class 10–C", value: "10–C" },
              { label: "Class 12–Sci", value: "12–Sci" },
            ]}
          />
          <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { label: "Active & Grading", value: "all" },
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
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{item.title}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{item.className}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{item.dueDate}</td>
                  <td className="py-3.5 px-4 text-sm text-ink">{item.submissions}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={STATUS_TONES[item.status]}>{item.status}</StatusBadge>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => showToast(`${item.actionLabel}: ${item.title}`)}
                      className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                    >
                      {item.actionLabel}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <form onSubmit={handlePublish} className="flex flex-col gap-4">
          <h2 className="text-base font-bold text-ink">
            Quick Create Assignment — Quadratic Equations / Geometry
          </h2>
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
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                options={[
                  { label: "Class 10–A & 10–C", value: "10–A & 10–C" },
                  { label: "Class 10–A", value: "10–A" },
                  { label: "Class 9–B", value: "9–B" },
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Due Date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" variant="primary" className="w-full">
                Publish Homework
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}

