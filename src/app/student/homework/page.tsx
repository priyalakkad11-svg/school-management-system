"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, FileUpload, Input, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { cn } from "@/lib/utils";
import {
  listPortalAcademicDataAction,
  submitStudentHomeworkAction,
} from "@/app/actions/academics-finance.actions";

interface StudentHomework {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: string;
}

export default function StudentHomeworkPage() {
  const { showToast } = useToast();
  const [items, setItems] = React.useState<StudentHomework[]>([]);
  const [selectedId, setSelectedId] = React.useState("");
  const [note, setNote] = React.useState("Completed all exercises.");
  const [fileName, setFileName] = React.useState("solution.pdf");
  const [submitting, setSubmitting] = React.useState(false);

  const reload = React.useCallback(async () => {
    const res = await listPortalAcademicDataAction();
    if (!res.ok || !res.data) return;
    const subSet = new Map(res.data.submissions.map((s) => [s.assignment_id, s.status]));
    const rows: StudentHomework[] = res.data.homework.map((h) => {
      const subObj = Array.isArray(h.subjects) ? h.subjects[0] : h.subjects;
      return {
        id: h.id,
        title: h.title,
        subject: subObj?.name ?? "General",
        dueDate: h.due_date,
        status: subSet.get(h.id) ?? "Pending",
      };
    });
    setItems(rows);
    if (rows[0]) setSelectedId((prev) => prev || rows[0].id);
  }, []);

  React.useEffect(() => {
    let active = true;
    void listPortalAcademicDataAction().then((res) => {
      if (!active || !res.ok || !res.data) return;
      const subSet = new Map(res.data.submissions.map((s) => [s.assignment_id, s.status]));
      const rows: StudentHomework[] = res.data.homework.map((h) => {
        const subObj = Array.isArray(h.subjects) ? h.subjects[0] : h.subjects;
        return {
          id: h.id,
          title: h.title,
          subject: subObj?.name ?? "General",
          dueDate: h.due_date,
          status: subSet.get(h.id) ?? "Pending",
        };
      });
      setItems(rows);
      if (rows[0]) setSelectedId(rows[0].id);
    });
    return () => {
      active = false;
    };
  }, []);

  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      showToast("No assignment selected.", "warning");
      return;
    }
    setSubmitting(true);
    const res = await submitStudentHomeworkAction({
      assignmentId: selected.id,
      submissionText: `${fileName} — ${note}`,
    });
    setSubmitting(false);
    if (!res.ok) {
      showToast(res.error ?? "Unable to submit homework.", "warning");
      return;
    }
    showToast(`Submitted ${fileName} for "${selected.title}".`, "success");
    await reload();
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
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-ink-muted">
                      No homework assignments published yet.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        item.id === selected?.id ? "bg-brand-soft/60" : "hover:bg-subtle/60",
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <span className="self-start">
              <StatusBadge tone="warning">
                Selected: {selected ? selected.title : "None"}
              </StatusBadge>
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
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting || !selected}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

