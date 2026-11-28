"use client";

import React from "react";
import { DataTablePage } from "@/components/templates/DataTablePage";
import { Button, Input, Select, Textarea } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";
import { getLiveNoticesAction } from "@/app/actions/live-data.actions";
import { publishNoticeAction } from "@/app/actions/academics-finance.actions";
import type { NoticeItem } from "@/types/domain";

export default function AdminNoticeBoardPage() {
  const { showToast } = useToast();
  const [notices, setNotices] = React.useState<NoticeItem[]>([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [audience, setAudience] = React.useState("All Portals");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    let active = true;
    void getLiveNoticesAction().then((data) => {
      if (active) setNotices(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const roles =
      audience === "Parents"
        ? ["parent"]
        : audience === "Grades 1–12"
          ? ["student", "parent", "teacher"]
          : ["admin", "teacher", "student", "parent"];
    const res = await publishNoticeAction({
      title: title.trim(),
      body: description.trim() || "Published via Principal Communication Desk.",
      category: "Circular",
      targetRoles: roles,
      isPublic: audience === "All Portals",
    });
    if (!res.ok) {
      showToast(res.error ?? "Unable to publish notice.", "warning");
      return;
    }
    const fresh = await getLiveNoticesAction();
    setNotices(fresh);
    setModalOpen(false);
    setTitle("");
    setDescription("");
    showToast("Notice broadcast to target portals.");
  };

  return (
    <>
      <DataTablePage<NoticeItem>
        role="admin"
        title="Notice Board & Announcements"
        subtitle="Publish digital circulars to Student, Parent, and Faculty portals"
        rows={notices}
        searchPlaceholder="Search circulars, audience, category..."
        primaryAction={{ label: "Publish Notice", onClick: () => setModalOpen(true) }}
        columns={[
          { id: "title", header: "Circular Title", accessor: (r) => r.title },
          { id: "aud", header: "Audience", accessor: (r) => r.audience },
          { id: "cat", header: "Category", accessor: (r) => r.category },
          { id: "date", header: "Published", accessor: (r) => r.date },
          { id: "views", header: "Portal Reads", accessor: (r) => r.views.toLocaleString() },
          {
            id: "status",
            header: "Status",
            accessor: (r) => r.status,
            badgeTone: (r) => (r.status === "Pinned" ? "primary" : "success"),
          },
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Publish New Notice">
        <form onSubmit={handlePublish} className="flex flex-col gap-4">
          <Input label="Notice Headline" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select
            label="Target Audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            options={[
              { label: "All Portals", value: "All Portals" },
              { label: "Parents", value: "Parents" },
              { label: "Grades 1–12", value: "Grades 1–12" },
            ]}
          />
          <Textarea
            label="Circular Details"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" variant="primary" className="w-full">
            Publish Circular
          </Button>
        </form>
      </Modal>
    </>
  );
}

