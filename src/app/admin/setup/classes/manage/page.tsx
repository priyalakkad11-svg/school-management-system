"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, ErrorState, Input, Select, Skeleton } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { SetupService } from "@/services/setup.service";
import type { SchoolClass } from "@/types/domain";

function ManageClassEditor({ editId, initial }: { editId?: string; initial?: SchoolClass | null }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = React.useState(false);

  const [className, setClassName] = React.useState(initial?.name ?? "Class 11 (Commerce)");
  const [gradeOrder, setGradeOrder] = React.useState(String(initial?.gradeOrder ?? 11));
  const [wing, setWing] = React.useState(initial?.wing ?? "Senior Wing");
  const [sections, setSections] = React.useState(initial?.sections.join(", ") ?? "A, B");
  const [capacity, setCapacity] = React.useState(String(initial?.capacity ?? 80));
  const [roomBlock, setRoomBlock] = React.useState(
    initial?.roomBlock ?? "Senior Academic Block — Floor 2",
  );
  const [classTeachers, setClassTeachers] = React.useState(
    initial?.classTeachers ?? "Mrs. Kavita Nair (+1)",
  );
  const [status, setStatus] = React.useState<"Active" | "Inactive">(initial?.status ?? "Active");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await SetupService.upsertClassSection({
        id: editId,
        name: className,
        gradeOrder: Number(gradeOrder),
        wing,
        sections,
        capacity: Number(capacity),
        roomBlock,
        classTeachers,
        status,
      });
      if (!res.ok) {
        showToast(res.error ?? "Unable to save class & sections.", "warning");
        return;
      }
      showToast(`Saved ${res.data?.name ?? className} successfully.`);
      router.push("/admin/setup/classes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6 max-w-4xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <h2 className="text-lg font-bold text-ink border-b border-line pb-3">
          {editId ? `Edit ${className}` : "Class & Section Configuration"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Class Name" value={className} onChange={(e) => setClassName(e.target.value)} />
          <Input
            label="Numeric Order / Grade (1–12)"
            type="number"
            value={gradeOrder}
            onChange={(e) => setGradeOrder(e.target.value)}
          />
          <Select
            label="Academic Wing"
            value={wing}
            onChange={(e) => setWing(e.target.value)}
            options={[
              { label: "Senior Wing", value: "Senior Wing" },
              { label: "Middle Wing", value: "Middle Wing" },
              { label: "Lab Wing", value: "Lab Wing" },
            ]}
          />
          <Input
            label="Sections (Comma-separated)"
            value={sections}
            onChange={(e) => setSections(e.target.value)}
          />
          <Input
            label="Total Seat Capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
          <Input label="Default Room Block" value={roomBlock} onChange={(e) => setRoomBlock(e.target.value)} />
          <Input
            label="Homeroom / Class Teachers"
            value={classTeachers}
            onChange={(e) => setClassTeachers(e.target.value)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
            options={[
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
          />
        </div>

        <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => router.push("/admin/setup/classes")}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving..." : "Save Class & Sections"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ManageClassLoader() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id") ?? undefined;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["setup-class", editId ?? "new"],
    queryFn: () => (editId ? SetupService.getClassById(editId) : Promise.resolve({ ok: true, data: null })),
    enabled: Boolean(editId),
  });

  if (editId && isLoading) {
    return (
      <Card className="p-6 max-w-4xl flex flex-col gap-4">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-40 w-full" />
      </Card>
    );
  }

  if (editId && data && !data.ok) {
    return (
      <Card className="p-6 max-w-4xl">
        <ErrorState
          description={data.error ?? "Unable to load class record."}
          onRetry={() => void refetch()}
        />
      </Card>
    );
  }

  return <ManageClassEditor key={editId ?? "new"} editId={editId} initial={data?.data} />;
}

export default function ManageClassSectionPage() {
  return (
    <AppShell
      role="admin"
      title="Add / Edit Class & Section"
      subtitle="Configure section labels, room wings, max seat capacity, and homeroom faculty"
    >
      <Suspense fallback={<Skeleton className="h-72 w-full max-w-4xl" />}>
        <ManageClassLoader />
      </Suspense>
    </AppShell>
  );
}
