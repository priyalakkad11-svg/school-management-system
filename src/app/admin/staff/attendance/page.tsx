"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { getLiveTeachersAction } from "@/app/actions/live-data.actions";
import { upsertStaffMemberAction } from "@/app/actions/students-staff.actions";
import type { Teacher } from "@/types/domain";

export default function StaffAttendancePage() {
  const { showToast } = useToast();
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [statuses, setStatuses] = React.useState<Record<string, "Present" | "On Leave" | "Late">>({});

  React.useEffect(() => {
    let active = true;
    void getLiveTeachersAction().then((rows) => {
      if (!active) return;
      setTeachers(rows);
      const map: Record<string, "Present" | "On Leave" | "Late"> = {};
      for (const r of rows) map[r.id] = r.status === "On Leave" ? "On Leave" : "Present";
      setStatuses(map);
    });
    return () => {
      active = false;
    };
  }, []);

  const cycle = (id: string) => {
    const order: ("Present" | "On Leave" | "Late")[] = ["Present", "Late", "On Leave"];
    setStatuses((prev) => {
      const cur = prev[id] ?? "Present";
      return { ...prev, [id]: order[(order.indexOf(cur) + 1) % order.length] };
    });
  };

  return (
    <AppShell
      role="admin"
      title="Faculty & Staff Attendance"
      subtitle="Biometric / RFID check-in register for today"
      actions={
        <Button
          variant="primary"
          onClick={async () => {
            if (teachers[0]) {
              await upsertStaffMemberAction({
                employeeCode: teachers[0].empId,
                fullName: teachers[0].name,
                category: "Teacher",
                department: teachers[0].department,
                designation: teachers[0].designation,
                baseSalaryInr: teachers[0].salaryGross,
              });
            }
            showToast("Saved staff attendance register.");
          }}
        >
          Save Register
        </Button>
      }
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Staff attendance register">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Emp ID</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Name</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Department</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Check-In</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {teachers.map((t) => {
                const st = statuses[t.id] ?? "Present";
                return (
                  <tr key={t.id} className="hover:bg-subtle/60">
                    <td className="py-3.5 px-4 text-sm font-bold text-ink">{t.empId}</td>
                    <td className="py-3.5 px-4 text-sm font-medium text-ink">{t.name}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{t.department}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">
                      {st === "On Leave" ? "—" : "07:54 AM"}
                    </td>
                    <td className="py-3.5 px-4">
                      <button type="button" onClick={() => cycle(t.id)} className="cursor-pointer rounded-full">
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

