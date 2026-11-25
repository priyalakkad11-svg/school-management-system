"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Button,
  Card,
  FileUpload,
  Input,
  Select,
  StatusBadge,
} from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const INITIAL_RESOURCES = [
  { id: "r1", title: "Ch. 5 Arithmetic Progressions Notes", className: "10–A / 10–C", format: "PDF (3.4 MB)", downloads: "74 views", date: "21 Nov" },
  { id: "r2", title: "Integration Formula Cheat Sheet", className: "12–Sci", format: "PDF (1.1 MB)", downloads: "31 views", date: "18 Nov" },
  { id: "r3", title: "Coordinate Plane Video Walkthrough", className: "9–B", format: "Video Link", downloads: "35 views", date: "14 Nov" },
  { id: "r4", title: "Sample Pre-Board Paper 2026", className: "10–A", format: "DOCX", downloads: "39 views", date: "10 Nov" },
];

export default function TeacherStudyMaterialPage() {
  const { showToast } = useToast();
  const [resources, setResources] = React.useState(INITIAL_RESOURCES);
  const [targetClass, setTargetClass] = React.useState("10–A, 10–C");
  const [subject, setSubject] = React.useState("Mathematics");
  const [title, setTitle] = React.useState("Ch. 6 Triangles — Revision Notes PDF");
  const [pickedFile, setPickedFile] = React.useState<string>("triangles-notes.pdf");

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setResources((prev) => [
      {
        id: `r-${Date.now()}`,
        title: title.trim(),
        className: targetClass,
        format: pickedFile.endsWith(".docx") ? "DOCX" : "PDF (2.2 MB)",
        downloads: "1 view",
        date: "Just now",
      },
      ...prev,
    ]);
    showToast(`Uploaded ${title} and notified ${targetClass} students.`);
  };

  return (
    <AppShell
      role="teacher"
      title="Study Material & Resources"
      subtitle="Upload lecture notes, sample papers, and video guides directly to student portals"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-5 p-6">
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink">Upload New Study Material</h2>
            <Select
              label="Class & Section"
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              options={[
                { label: "Class 10–A, 10–C", value: "10–A, 10–C" },
                { label: "Class 12–Sci", value: "12–Sci" },
                { label: "Class 9–B", value: "9–B" },
              ]}
            />
            <Select
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              options={[
                { label: "Mathematics", value: "Mathematics" },
                { label: "Applied Calculus", value: "Applied Calculus" },
                { label: "Statistics", value: "Statistics" },
              ]}
            />
            <Input
              label="Resource Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <FileUpload
              title="Drop PDF / PPTX / Video Link here"
              subtitle="Max file size 50 MB"
              onFileSelected={setPickedFile}
            />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Upload &amp; Notify Students
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-7 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Published Study Materials</h2>
            <span className="text-xs text-ink-muted">{resources.length} records shown</span>
          </div>

          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Published study materials">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle border-b border-line">
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Resource Name</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Class</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Type</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Downloads</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-subtle/60">
                    <td className="py-3 px-3 text-sm font-semibold text-ink">{res.title}</td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{res.className}</td>
                    <td className="py-3 px-3">
                      <StatusBadge tone={res.format.includes("Video") ? "primary" : "info"}>
                        {res.format}
                      </StatusBadge>
                    </td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{res.downloads}</td>
                    <td className="py-3 px-3 text-sm text-ink-muted">{res.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

