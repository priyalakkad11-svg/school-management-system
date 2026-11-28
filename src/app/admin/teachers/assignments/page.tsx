"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  listTeacherAllocationsAndSubsAction,
  saveTeacherAllocationAction,
} from "@/app/actions/students-staff.actions";

interface AllocationRow {
  id: string;
  teacher: string;
  cls: string;
  subject: string;
  periods: string;
  room: string;
}

export default function TeacherSubjectAssignmentPage() {
  const { showToast } = useToast();
  const [allocations, setAllocations] = React.useState<AllocationRow[]>([]);
  const [classOptions, setClassOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [teacherOptions, setTeacherOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [subjectOptions, setSubjectOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [classId, setClassId] = React.useState("");
  const [teacherId, setTeacherId] = React.useState("");
  const [subjectId, setSubjectId] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const reload = React.useCallback(async () => {
    const res = await listTeacherAllocationsAndSubsAction();
    if (!res.ok || !res.data) return;
    setClassOptions(res.data.classes.map((c) => ({ label: c.name, value: c.id })));
    setTeacherOptions(res.data.teachers.map((t) => ({ label: t.full_name, value: t.id })));
    setSubjectOptions(res.data.subjects.map((s) => ({ label: s.name, value: s.id })));
    const rows: AllocationRow[] = res.data.allocations.map((a) => {
      const t = Array.isArray(a.staff_members) ? a.staff_members[0] : a.staff_members;
      const c = Array.isArray(a.school_classes) ? a.school_classes[0] : a.school_classes;
      const s = Array.isArray(a.subjects) ? a.subjects[0] : a.subjects;
      return {
        id: a.id,
        teacher: t?.full_name ?? "Teacher",
        cls: `${c?.name ?? "Class"}–${a.section_name}${a.is_class_teacher ? " (Class Teacher)" : ""}`,
        subject: s?.name ?? "General",
        periods: `${a.periods_per_week} / week`,
        room: "Assigned Wing",
      };
    });
    setAllocations(rows);
  }, []);

  React.useEffect(() => {
    let active = true;
    void listTeacherAllocationsAndSubsAction().then((res) => {
      if (!active || !res.ok || !res.data) return;
      const clsOpts = res.data.classes.map((c) => ({ label: c.name, value: c.id }));
      const tchOpts = res.data.teachers.map((t) => ({ label: t.full_name, value: t.id }));
      const subOpts = res.data.subjects.map((s) => ({ label: s.name, value: s.id }));
      setClassOptions(clsOpts);
      setTeacherOptions(tchOpts);
      setSubjectOptions(subOpts);
      if (clsOpts[0]) setClassId(clsOpts[0].value);
      if (tchOpts[0]) setTeacherId(tchOpts[0].value);
      if (subOpts[0]) setSubjectId(subOpts[0].value);
      setAllocations(
        res.data.allocations.map((a) => {
          const t = Array.isArray(a.staff_members) ? a.staff_members[0] : a.staff_members;
          const c = Array.isArray(a.school_classes) ? a.school_classes[0] : a.school_classes;
          const s = Array.isArray(a.subjects) ? a.subjects[0] : a.subjects;
          return {
            id: a.id,
            teacher: t?.full_name ?? "Teacher",
            cls: `${c?.name ?? "Class"}–${a.section_name}${a.is_class_teacher ? " (Class Teacher)" : ""}`,
            subject: s?.name ?? "General",
            periods: `${a.periods_per_week} / week`,
            room: "Assigned Wing",
          };
        }),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  const handleAssign = async () => {
    if (!classId || !teacherId) {
      showToast("Select both class and teacher.", "warning");
      return;
    }
    setSaving(true);
    const res = await saveTeacherAllocationAction({
      classId,
      sectionName: "A",
      teacherId,
      subjectId: subjectId || undefined,
      periodsPerWeek: 5,
    });
    setSaving(false);
    if (!res.ok) {
      showToast(res.error ?? "Unable to save allocation.", "warning");
      return;
    }
    showToast("Saved faculty allocation to database.", "success");
    await reload();
  };

  return (
    <AppShell
      role="admin"
      title="Teacher–Subject–Class Allocation"
      subtitle="Assign faculty members to sections and monitor weekly period loads"
      actions={
        <Button variant="primary" disabled={saving} onClick={() => void handleAssign()}>
          {saving ? "Saving..." : "Assign Teacher to Class"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Class"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          options={classOptions.length ? classOptions : [{ label: "Loading classes...", value: "" }]}
        />
        <Select
          label="Teacher"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          options={teacherOptions.length ? teacherOptions : [{ label: "Loading teachers...", value: "" }]}
        />
        <Select
          label="Subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          options={subjectOptions.length ? subjectOptions : [{ label: "General", value: "" }]}
        />
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Faculty Workload Matrix</h2>
          <span className="text-xs text-ink-muted">{allocations.length} allocations</span>
        </div>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Teacher allocation matrix">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Faculty</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Role / Class</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Subject</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Weekly Load</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Primary Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-ink-muted">
                    No subject allocations saved yet. Use the selector above to add one.
                  </td>
                </tr>
              ) : (
                allocations.map((a) => (
                  <tr key={a.id} className="hover:bg-subtle/60">
                    <td className="py-3.5 px-4 text-sm font-semibold text-ink">{a.teacher}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{a.cls}</td>
                    <td className="py-3.5 px-4 text-sm text-ink">{a.subject}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge tone="primary">{a.periods}</StatusBadge>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{a.room}</td>
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

