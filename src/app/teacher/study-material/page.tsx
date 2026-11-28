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
import {
  listPortalAcademicDataAction,
  uploadStudyMaterialAction,
} from "@/app/actions/academics-finance.actions";

interface ResourceRow {
  id: string;
  title: string;
  className: string;
  format: string;
  date: string;
}

export default function TeacherStudyMaterialPage() {
  const { showToast } = useToast();
  const [resources, setResources] = React.useState<ResourceRow[]>([]);
  const [classOptions, setClassOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [targetClassId, setTargetClassId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [pickedFile, setPickedFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const loadData = React.useCallback(async () => {
    const res = await listPortalAcademicDataAction();
    if (!res.ok || !res.data) return;
    setClassOptions(res.data.classes.map((c) => ({ label: c.name, value: c.id })));
    setResources(
      res.data.materials.map((m) => {
        const cObj = Array.isArray(m.school_classes) ? m.school_classes[0] : m.school_classes;
        return {
          id: m.id,
          title: m.title,
          className: cObj?.name ?? "All Classes",
          format: m.material_type || "PDF",
          date: new Date(m.created_at).toLocaleDateString("en-IN"),
        };
      }),
    );
  }, []);

  React.useEffect(() => {
    let active = true;
    void listPortalAcademicDataAction().then((res) => {
      if (!active || !res.ok || !res.data) return;
      const cOpts = res.data.classes.map((c) => ({ label: c.name, value: c.id }));
      setClassOptions(cOpts);
      if (cOpts[0]) setTargetClassId(cOpts[0].value);
      setResources(
        res.data.materials.map((m) => {
          const cObj = Array.isArray(m.school_classes) ? m.school_classes[0] : m.school_classes;
          return {
            id: m.id,
            title: m.title,
            className: cObj?.name ?? "All Classes",
            format: m.material_type || "PDF",
            date: new Date(m.created_at).toLocaleDateString("en-IN"),
          };
        }),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pickedFile) {
      showToast("Provide a resource title and choose a file.", "warning");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("file", pickedFile);
    if (targetClassId) fd.append("classId", targetClassId);
    const res = await uploadStudyMaterialAction(fd);
    setUploading(false);
    if (!res.ok) {
      showToast(res.error ?? "Upload failed.", "warning");
      return;
    }
    showToast(`Uploaded ${title.trim()} to study-material bucket.`, "success");
    setTitle("");
    setPickedFile(null);
    await loadData();
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
              label="Class"
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              options={classOptions.length ? classOptions : [{ label: "All Classes", value: "" }]}
            />
            <Input
              label="Resource Title"
              placeholder="Ch. 6 Triangles — Revision Notes PDF"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <FileUpload
              title={pickedFile ? pickedFile.name : "Drop PDF / PPTX / DOCX here"}
              subtitle="Max file size 50 MB"
              accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg"
              onFileSelected={(_name, file) => setPickedFile(file ?? null)}
            />
            <Button type="submit" variant="primary" size="lg" disabled={uploading} className="w-full">
              {uploading ? "Uploading..." : "Upload & Notify Students"}
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
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-ink-muted">
                      No study material uploaded yet.
                    </td>
                  </tr>
                ) : (
                  resources.map((res) => (
                    <tr key={res.id} className="hover:bg-subtle/60">
                      <td className="py-3 px-3 text-sm font-semibold text-ink">{res.title}</td>
                      <td className="py-3 px-3 text-sm text-ink-secondary">{res.className}</td>
                      <td className="py-3 px-3">
                        <StatusBadge tone="info">{res.format}</StatusBadge>
                      </td>
                      <td className="py-3 px-3 text-sm text-ink-muted">{res.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

