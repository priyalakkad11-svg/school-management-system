"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  listTeacherAllocationsAndSubsAction,
  saveTimetableSubstitutionAction,
} from "@/app/actions/students-staff.actions";

interface SlotSubRow {
  id: string;
  absent: string;
  originalTeacherId: string | null;
  cls: string;
  substituteId: string;
  assigned: boolean;
}

export default function SubstitutionManagementPage() {
  const { showToast } = useToast();
  const [slots, setSlots] = React.useState<SlotSubRow[]>([]);
  const [teacherOptions, setTeacherOptions] = React.useState<{ label: string; value: string }[]>([]);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void listTeacherAllocationsAndSubsAction().then((res) => {
      if (!active || !res.ok || !res.data) return;
      const tOpts = res.data.teachers.map((t) => ({ label: t.full_name, value: t.id }));
      setTeacherOptions(tOpts);
      const existingSubSlots = new Set(res.data.substitutions.map((s) => s.slot_id));
      const rows: SlotSubRow[] = res.data.slots.slice(0, 15).map((sl) => {
        const clsObj = Array.isArray(sl.school_classes) ? sl.school_classes[0] : sl.school_classes;
        const subObj = Array.isArray(sl.subjects) ? sl.subjects[0] : sl.subjects;
        const tchObj = Array.isArray(sl.staff_members) ? sl.staff_members[0] : sl.staff_members;
        const defaultSub = tOpts.find((t) => t.value !== sl.teacher_id)?.value ?? tOpts[0]?.value ?? "";
        return {
          id: sl.id,
          absent: tchObj?.full_name ?? "Assigned Teacher",
          originalTeacherId: sl.teacher_id,
          cls: `${clsObj?.name ?? "Class"}–${sl.section_name} (P${sl.period_number} ${subObj?.name ?? "Subject"})`,
          substituteId: defaultSub,
          assigned: existingSubSlots.has(sl.id),
        };
      });
      setSlots(rows);
    });
    return () => {
      active = false;
    };
  }, []);

  const assignSub = async (row: SlotSubRow) => {
    if (!row.substituteId) {
      showToast("No substitute teacher available.", "warning");
      return;
    }
    setBusyId(row.id);
    const res = await saveTimetableSubstitutionAction({
      slotId: row.id,
      originalTeacherId: row.originalTeacherId,
      substituteTeacherId: row.substituteId,
      subDate: new Date().toISOString().slice(0, 10),
      reason: `Cover for ${row.cls}`,
    });
    setBusyId(null);
    if (!res.ok) {
      showToast(res.error ?? "Failed to confirm substitution.", "warning");
      return;
    }
    setSlots((prev) => prev.map((s) => (s.id === row.id ? { ...s, assigned: true } : s)));
    showToast("Substitute teacher assigned and notified.", "success");
  };

  return (
    <AppShell
      role="admin"
      title="Daily Substitute Arrangement"
      subtitle="Assign available free-period teachers for faculty on approved leave"
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Substitution table">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Regular Faculty</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Affected Period</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Assigned Substitute</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Status</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {slots.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-ink-muted">
                    No timetable slots configured yet.
                  </td>
                </tr>
              ) : (
                slots.map((s) => (
                  <tr key={s.id} className="hover:bg-subtle/60">
                    <td className="py-3.5 px-4 text-sm font-semibold text-ink">{s.absent}</td>
                    <td className="py-3.5 px-4 text-sm text-ink-secondary">{s.cls}</td>
                    <td className="py-3.5 px-4">
                      <Select
                        aria-label={`Substitute for ${s.cls}`}
                        value={s.substituteId}
                        onChange={(e) =>
                          setSlots((prev) =>
                            prev.map((item) =>
                              item.id === s.id ? { ...item, substituteId: e.target.value } : item,
                            ),
                          )
                        }
                        options={teacherOptions.length ? teacherOptions : [{ label: "Loading...", value: "" }]}
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge tone={s.assigned ? "success" : "warning"}>
                        {s.assigned ? "Confirmed" : "Needs Cover"}
                      </StatusBadge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={busyId === s.id}
                        onClick={() => void assignSub(s)}
                      >
                        {busyId === s.id ? "Saving..." : "Confirm Cover"}
                      </Button>
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

