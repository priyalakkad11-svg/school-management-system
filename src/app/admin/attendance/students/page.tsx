"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { getLiveStudentsAction } from "@/app/actions/live-data.actions";
import { markStudentAttendanceBatchAction } from "@/app/actions/students-staff.actions";
import { listClassesAction } from "@/app/actions/setup.actions";
import type { Student } from "@/types/domain";

export default function AdminStudentAttendancePage() {
  const { showToast } = useToast();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [classId, setClassId] = React.useState("");
  const [classOptions, setClassOptions] = React.useState<Array<{ label: string; value: string }>>([]);
  const [section, setSection] = React.useState("A");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = React.useState<Record<string, "Present" | "Absent" | "Late">>({});

  React.useEffect(() => {
    let active = true;
    void Promise.all([getLiveStudentsAction(), listClassesAction()]).then(([stuRows, clsRes]) => {
      if (!active) return;
      setStudents(stuRows);
      const init: Record<string, "Present" | "Absent" | "Late"> = {};
      stuRows.forEach((s) => {
        init[s.id] = "Present";
      });
      setMarks(init);
      if (clsRes.ok && clsRes.data && clsRes.data.rows.length > 0) {
        setClassOptions(clsRes.data.rows.map((c) => ({ label: c.name, value: c.id })));
        setClassId(clsRes.data.rows[0].id);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const cycle = (id: string) => {
    const order: ("Present" | "Absent" | "Late")[] = ["Present", "Absent", "Late"];
    setMarks((prev) => {
      const cur = prev[id] ?? "Present";
      return { ...prev, [id]: order[(order.indexOf(cur) + 1) % order.length] };
    });
  };

  const handleSave = async () => {
    if (!classId || students.length === 0) {
      showToast("No active students or class selected.", "warning");
      return;
    }
    const res = await markStudentAttendanceBatchAction({
      classId,
      sectionName: section,
      attendanceDate: date,
      entries: students.map((s) => ({
        studentId: s.id,
        status: marks[s.id] ?? "Present",
      })),
    });
    if (!res.ok || !res.data) {
      showToast(res.error ?? "Failed saving attendance.", "warning");
      return;
    }
    showToast(
      `Saved ${res.data.marked} attendance entries (${res.data.absentAlertsQueued} absent alerts queued).`,
    );
  };

  return (
    <AppShell
      role="admin"
      title="Student Attendance (Class-wise)"
      subtitle="Monitor and record section attendance registers across Grades Nursery–12"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              const next: Record<string, "Present" | "Absent" | "Late"> = {};
              students.forEach((s) => {
                next[s.id] = "Present";
              });
              setMarks(next);
              showToast("Marked all loaded students Present.");
            }}
          >
            Mark All Present
          </Button>
          <Button variant="primary" onClick={() => void handleSave()}>
            Lock &amp; Notify Parents
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <Select
          label="Class"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          options={classOptions.length > 0 ? classOptions : [{ label: "Default Class", value: "" }]}
        />
        <Select
          label="Section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          options={[
            { label: "Section A", value: "A" },
            { label: "Section B", value: "B" },
            { label: "Section C", value: "C" },
          ]}
        />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Class attendance table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Roll No</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Admission ID</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Student Name</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Guardian Mobile</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {students.slice(0, 20).map((s) => {
                const st = marks[s.id] ?? "Present";
                return (
                  <tr key={s.id} className="hover:bg-subtle/60">
                    <td className="py-3.5 px-4 text-sm font-bold text-ink">{s.rollNo}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{s.admissionId}</td>
                    <td className="py-3.5 px-4 text-sm font-medium text-ink">{s.name}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{s.parentPhone}</td>
                    <td className="py-3.5 px-4">
                      <button type="button" onClick={() => cycle(s.id)} className="cursor-pointer rounded-full">
                        <StatusBadge
                          tone={st === "Present" ? "success" : st === "Late" ? "warning" : "danger"}
                        >
                          {st}
                        </StatusBadge>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

