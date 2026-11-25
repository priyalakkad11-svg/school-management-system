"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const MATERIALS = [
  { id: "m1", title: "Ch. 5 Arithmetic Progressions Notes", subject: "Mathematics", teacher: "Mrs. Kavita Nair", format: "PDF • 3.4 MB", tone: "info" as const, action: "Download" },
  { id: "m2", title: "Ray Optics & Lenses Diagram Deck", subject: "Physics", teacher: "Mr. Arjun Menon", format: "PPTX • 8.2 MB", tone: "primary" as const, action: "Download" },
  { id: "m3", title: "SQL Normalization Lecture Video", subject: "Comp. Science", teacher: "Mr. Vikram Rao", format: "MP4 • 18 min", tone: "success" as const, action: "Watch" },
  { id: "m4", title: "Pre-Board Sample Question Bank", subject: "English", teacher: "Ms. Clara D'Souza", format: "PDF • 1.9 MB", tone: "info" as const, action: "Download" },
];

export default function StudentStudyMaterialPage() {
  const { showToast } = useToast();
  const [subject, setSubject] = React.useState("all");
  const [format, setFormat] = React.useState("all");
  const [topic, setTopic] = React.useState("");

  const filtered = React.useMemo(
    () =>
      MATERIALS.filter((m) => {
        if (subject !== "all" && m.subject !== subject) return false;
        if (format !== "all" && !m.format.startsWith(format)) return false;
        if (topic.trim() && !m.title.toLowerCase().includes(topic.trim().toLowerCase())) return false;
        return true;
      }),
    [subject, format, topic],
  );

  return (
    <AppShell
      role="student"
      title="Study Material Library"
      subtitle="Download teacher-verified notes, slide decks, and recorded revision lectures"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          options={[
            { label: "All Subjects", value: "all" },
            { label: "Mathematics", value: "Mathematics" },
            { label: "Physics", value: "Physics" },
            { label: "Comp. Science", value: "Comp. Science" },
            { label: "English", value: "English" },
          ]}
        />
        <Select
          label="Format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          options={[
            { label: "PDF, Slides & Videos", value: "all" },
            { label: "PDF", value: "PDF" },
            { label: "PPTX", value: "PPTX" },
            { label: "MP4", value: "MP4" },
          ]}
        />
        <Input
          label="Search Topic"
          placeholder="Trigonometry, Optics..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Available Class 10–A Resources</h2>
          <span className="text-xs text-ink-muted">{filtered.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Study material resources">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Title</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Subject</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Uploaded By</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Format</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-semibold text-ink">{item.title}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{item.subject}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{item.teacher}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge tone={item.tone}>{item.format}</StatusBadge>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => showToast(`Opening ${item.title} (${item.action})`)}
                      className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                    >
                      {item.action}
                    </button>
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

