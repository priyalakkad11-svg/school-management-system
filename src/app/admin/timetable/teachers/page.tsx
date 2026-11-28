"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, Select, StatusBadge } from "@/components/ui/primitives";
import { getLiveTeachersAction } from "@/app/actions/live-data.actions";
import type { Teacher } from "@/types/domain";

export default function AdminTeacherTimetablePage() {
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = React.useState("");

  React.useEffect(() => {
    let active = true;
    void getLiveTeachersAction().then((rows) => {
      if (!active) return;
      setTeachers(rows);
      if (rows[0]) setTeacherId(rows[0].id);
    });
    return () => {
      active = false;
    };
  }, []);

  const teacher = teachers.find((t) => t.id === teacherId) ?? teachers[0] ?? {
    id: "",
    empId: "—",
    name: "Loading Faculty...",
    department: "General",
    designation: "Faculty",
    qualification: "",
    classesAssigned: "Active Classes",
    periodsPerWeek: 24,
    email: "",
    phone: "",
    salaryGross: 0,
    joinDate: "",
    status: "Active" as const,
  };

  return (
    <AppShell
      role="admin"
      title="Faculty Timetable & Period Load"
      subtitle="Verify balanced weekly teaching hours across all faculty members"
    >
      <div className="w-full sm:w-80">
        <Select
          label="Faculty Member"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          options={teachers.map((t) => ({ label: `${t.name} (${t.department})`, value: t.id }))}
        />
      </div>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-ink">
            {teacher.name} • {teacher.periodsPerWeek} Periods / Week
          </h2>
          <StatusBadge tone="primary">{teacher.classesAssigned}</StatusBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-md bg-subtle p-4">
            <div className="font-bold text-ink">Morning Slots (P1–P3)</div>
            <div className="text-ink-secondary pt-1">10–A, 9–B, Prep Period</div>
          </div>
          <div className="rounded-md bg-subtle p-4">
            <div className="font-bold text-ink">Midday Slots (P4–P5)</div>
            <div className="text-ink-secondary pt-1">12–Sci Calculus, Lab Coordination</div>
          </div>
          <div className="rounded-md bg-subtle p-4">
            <div className="font-bold text-ink">Afternoon Slots (P6–P7)</div>
            <div className="text-ink-secondary pt-1">10–C Mathematics, Olympiad Coaching</div>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}

