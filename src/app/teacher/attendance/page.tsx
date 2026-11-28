"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { getLiveStudentsAction } from "@/app/actions/live-data.actions";
import { markStudentAttendanceBatchAction } from "@/app/actions/students-staff.actions";
import { listClassesAction } from "@/app/actions/setup.actions";

type AttendanceMark = "Present" | "Absent" | "Late";

interface RosterRow {
  id: string;
  rollNo: string;
  name: string;
  admissionId: string;
  status: AttendanceMark;
  remark: string;
}

export default function TeacherAttendancePage() {
  const { showToast } = useToast();
  const [selectedClass, setSelectedClass] = React.useState("Class 10-A");
  const [classId, setClassId] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = React.useState("Period 1 — Mathematics");
  const [roster, setRoster] = React.useState<RosterRow[]>([]);

  React.useEffect(() => {
    let active = true;
    void Promise.all([getLiveStudentsAction(), listClassesAction()]).then(([stu, clsRes]) => {
      if (!active) return;
      setRoster(
        stu.map((s) => ({
          id: s.id,
          rollNo: s.rollNo,
          name: s.name,
          admissionId: s.admissionId,
          status: "Present",
          remark: "—",
        })),
      );
      if (clsRes.ok && clsRes.data?.rows[0]) setClassId(clsRes.data.rows[0].id);
    });
    return () => {
      active = false;
    };
  }, []);

  const cycleStatus = (id: string) => {
    const order: AttendanceMark[] = ["Present", "Absent", "Late"];
    setRoster((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = order[(order.indexOf(row.status) + 1) % order.length];
        return { ...row, status: next };
      }),
    );
  };

  const markAllPresent = () => {
    setRoster((prev) => prev.map((r) => ({ ...r, status: "Present" })));
    showToast(`All ${roster.length} students marked Present.`);
  };

  const handleSubmit = async () => {
    if (!classId || roster.length === 0) {
      showToast("No students loaded for selected class.", "warning");
      return;
    }
    const res = await markStudentAttendanceBatchAction({
      classId,
      sectionName: "A",
      attendanceDate: date,
      entries: roster.map((r) => ({ studentId: r.id, status: r.status })),
    });
    if (!res.ok || !res.data) {
      showToast(res.error ?? "Failed submitting attendance.", "warning");
      return;
    }
    const presentCount = roster.filter((r) => r.status === "Present").length;
    showToast(
      `Attendance saved for ${selectedClass} (${presentCount}/${roster.length} Present; ${res.data.absentAlertsQueued} parent alerts queued).`,
    );
  };

  return (
    <AppShell
      role="teacher"
      title="Mark Student Attendance"
      subtitle="Daily roll-call register with instant absent notification sync to parents"
    >
      <Card className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-3">
          <Select
            label="Class & Section"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={[
              { label: "Class 10–A", value: "Class 10-A" },
              { label: "Class 10–C", value: "Class 10-C" },
              { label: "Class 9–B", value: "Class 9-B" },
            ]}
          />
        </div>
        <div className="lg:col-span-3">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="lg:col-span-3">
          <Select
            label="Subject / Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { label: "Period 1 — Mathematics", value: "Period 1 — Mathematics" },
              { label: "Period 4 — Calculus", value: "Period 4 — Calculus" },
            ]}
          />
        </div>
        <div className="lg:col-span-3 flex flex-wrap gap-2 justify-start lg:justify-end">
          <Button variant="secondary" onClick={markAllPresent}>
            Mark All Present
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit Attendance
          </Button>
        </div>
      </Card>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">{selectedClass} Student Roster (40 Students)</h2>
          <span className="text-xs text-ink-muted">{roster.length} records shown</span>
        </div>

        <div className="hidden md:block overflow-x-auto" tabIndex={0} role="region" aria-label="Student attendance table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Roll No</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Student Name</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Admission ID</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status (Click to toggle)</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {roster.map((row) => (
                <tr key={row.id} className="hover:bg-subtle/60">
                  <td className="py-3 px-4 text-sm font-semibold text-ink">{row.rollNo}</td>
                  <td className="py-3 px-4 text-sm font-medium text-ink">{row.name}</td>
                  <td className="py-3 px-4 text-sm text-ink-secondary">{row.admissionId}</td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => cycleStatus(row.id)}
                      className="cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-line-focus"
                    >
                      <StatusBadge
                        tone={
                          row.status === "Present"
                            ? "success"
                            : row.status === "Absent"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {row.status}
                      </StatusBadge>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-sm text-ink-secondary">{row.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden flex flex-col gap-3">
          {roster.map((row) => (
            <div key={row.id} className="rounded-md border border-line p-3.5 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-ink">
                  #{row.rollNo} • {row.name}
                </div>
                <div className="text-xs text-ink-secondary">{row.admissionId}</div>
              </div>
              <button
                type="button"
                onClick={() => cycleStatus(row.id)}
                className="min-h-11 px-2 cursor-pointer"
              >
                <StatusBadge
                  tone={
                    row.status === "Present"
                      ? "success"
                      : row.status === "Absent"
                        ? "danger"
                        : "warning"
                  }
                >
                  {row.status}
                </StatusBadge>
              </button>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}

