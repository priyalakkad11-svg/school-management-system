"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  getStudyMaterialSignedUrlAction,
  listPortalAcademicDataAction,
} from "@/app/actions/academics-finance.actions";

interface MaterialItem {
  id: string;
  title: string;
  subject: string;
  className: string;
  format: string;
  storagePath: string;
}

export default function StudentStudyMaterialPage() {
  const { showToast } = useToast();
  const [materials, setMaterials] = React.useState<MaterialItem[]>([]);
  const [subject, setSubject] = React.useState("all");
  const [topic, setTopic] = React.useState("");

  React.useEffect(() => {
    let active = true;
    void listPortalAcademicDataAction().then((res) => {
      if (!active || !res.ok || !res.data) return;
      setMaterials(
        res.data.materials.map((m) => {
          const sObj = Array.isArray(m.subjects) ? m.subjects[0] : m.subjects;
          const cObj = Array.isArray(m.school_classes) ? m.school_classes[0] : m.school_classes;
          return {
            id: m.id,
            title: m.title,
            subject: sObj?.name ?? "General",
            className: cObj?.name ?? "All Classes",
            format: m.material_type || "PDF",
            storagePath: m.storage_path,
          };
        }),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = materials.filter((m) => {
    if (subject !== "all" && m.subject !== subject) return false;
    if (topic.trim() && !m.title.toLowerCase().includes(topic.trim().toLowerCase())) return false;
    return true;
  });

  const subjectOptions = [
    { label: "All Subjects", value: "all" },
    ...Array.from(new Set(materials.map((m) => m.subject))).map((s) => ({ label: s, value: s })),
  ];

  const handleOpen = async (item: MaterialItem) => {
    const res = await getStudyMaterialSignedUrlAction(item.storagePath);
    if (!res.ok || !res.data?.signedUrl) {
      showToast(res.error ?? "Signed download link unavailable.", "warning");
      return;
    }
    window.open(res.data.signedUrl, "_blank", "noopener,noreferrer");
    showToast(`Opened ${item.title}.`, "success");
  };

  return (
    <AppShell
      role="student"
      title="Study Material Library"
      subtitle="Download teacher-verified notes, slide decks, and recorded revision lectures"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          options={subjectOptions}
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
          <h2 className="text-base font-bold text-ink">Available Resources</h2>
          <span className="text-xs text-ink-muted">{filtered.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Study material resources">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Title</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Subject</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Class</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Format</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-ink-muted">
                    No study materials uploaded for your class yet.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-subtle/60">
                    <td className="py-3.5 px-4 text-sm font-semibold text-ink">{item.title}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{item.subject}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{item.className}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge tone="info">{item.format}</StatusBadge>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => void handleOpen(item)}
                        className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

