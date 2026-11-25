"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, FileUpload, Input, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { cn } from "@/lib/utils";

interface StudentHomework {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Graded 19/20";
}

const INITIAL_LIST: StudentHomework[] = [
  { id: "sh-1", title: "Quadratic Equations Set #4", subject: "Mathematics", dueDate: "28 Nov 2026", status: "Pending" },
  { id: "sh-2", title: "Newton's Laws Lab Report", subject: "Physics", dueDate: "30 Nov 2026", status: "Pending" },
  { id: "sh-3", title: "Shakespeare Essay Draft", subject: "English", dueDate: "22 Nov 2026", status: "Submitted" },
  { id: "sh-4", title: "SQL Joins Practice", subject: "Comp. Science", dueDate: "18 Nov 2026", status: "Graded 19/20" },
];

export default function StudentHomeworkPage() {
  const { showToast } = useToast();
  const [items, setItems] = React.useState(INITIAL_LIST);
  const [selectedId, setSelectedId] = React.useState("sh-1");
  const [note, setNote] = React.useState("Completed all 15 problems.");
  const [fileName, setFileName] = React.useState("aarav_math_set4.pdf (2.1 MB)");

  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setItems((prev) =>
      prev.map((item) =>
        item.id === selected.id ? { ...item, status: "Submitted" } : item,
      ),
    );
    showToast(`Submitted ${fileName} for "${selected.title}".`);
  };

  return (
    <AppShell
      role="student"
      title="Homework & Assignment Submissions"
      subtitle="Select an assignment to upload your completed solution file"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-8 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">My Assignments</h2>
            <span className="text-xs text-ink-muted">{items.length} entries</span>
          </div>

          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="My assignments">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle border-b border-line">
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Title</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Subject</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Due Date</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "cursor-pointer transition-colors",
                      item.id === selected.id ? "bg-brand-soft/60" : "hover:bg-subtle/60",
                    )}
                  >
                    <td className="py-3 px-3 text-sm font-semibold text-ink">
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className="text-left cursor-pointer hover:text-brand"
                      >
                        {item.title}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{item.subject}</td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{item.dueDate}</td>
                    <td className="py-3 px-3">
                      <StatusBadge
                        tone={
                          item.status.startsWith("Graded")
                            ? "success"
                            : item.status === "Submitted"
                              ? "info"
                              : "warning"
                        }
                      >
                        {item.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <span className="self-start">
              <StatusBadge tone="warning">Selected: {selected.title}</StatusBadge>
            </span>
            <h2 className="text-lg font-bold text-ink">Submit Homework</h2>
            <p className="text-xs text-ink-secondary">
              Solve exercises cleanly and upload scanned PDF or lab sheet.
            </p>
            <FileUpload
              title={fileName}
              subtitle="PDF / DOCX / PNG up to 50 MB"
              onFileSelected={(name) => setFileName(name)}
            />
            <Input
              label="Student Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Submit Assignment
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
