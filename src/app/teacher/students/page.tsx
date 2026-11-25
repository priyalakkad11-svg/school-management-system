"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { MOCK_STUDENTS } from "@/mocks/school.data";
import { cn } from "@/lib/utils";

export default function TeacherStudentsPage() {
  const [selectedId, setSelectedId] = React.useState(MOCK_STUDENTS[0].id);
  const selected = MOCK_STUDENTS.find((s) => s.id === selectedId) ?? MOCK_STUDENTS[0];

  return (
    <AppShell
      role="teacher"
      title="Class-wise Student List & Profile"
      subtitle="Inspect attendance metrics, math averages, and guardian contact details"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-7 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Class 10–A Directory (40)</h2>
            <span className="text-xs text-ink-muted">{MOCK_STUDENTS.length} records shown</span>
          </div>

          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Class student directory">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-subtle border-b border-line">
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Roll</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Student Name</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Attendance</th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {MOCK_STUDENTS.map((s) => {
                  const active = s.id === selected.id;
                  const lowAtt = s.attendancePct < 85;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        active ? "bg-brand-soft/60" : "hover:bg-subtle/60",
                      )}
                    >
                      <td className="py-3 px-3 text-sm font-semibold text-ink">{s.rollNo}</td>
                      <td className="py-3 px-3 text-sm font-medium text-ink">
                        <button
                          type="button"
                          onClick={() => setSelectedId(s.id)}
                          className="text-left font-medium hover:text-brand cursor-pointer"
                        >
                          {s.name}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-sm text-ink-secondary">{s.attendancePct}%</td>
                      <td className="py-3 px-3">
                        <StatusBadge
                          tone={active ? "primary" : lowAtt ? "warning" : "success"}
                        >
                          {active ? "Selected" : lowAtt ? "Low Att." : s.status}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-5 p-6 flex flex-col gap-4">
          <div className="self-start">
            <StatusBadge tone="primary">
              {selected.admissionId} • Class {selected.className}–{selected.section}
            </StatusBadge>
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">{selected.name}</h2>
            <p className="text-xs text-ink-secondary pt-1">
              Parent: {selected.parentName} • {selected.parentPhone}
            </p>
          </div>
          <dl className="divide-y divide-line text-sm">
            <div className="py-2.5">
              <dt className="text-xs text-ink-muted">Overall Attendance</dt>
              <dd className="font-semibold text-ink pt-0.5">{selected.attendancePct}% (AY 2026–27)</dd>
            </div>
            <div className="py-2.5">
              <dt className="text-xs text-ink-muted">Mathematics / Term Average</dt>
              <dd className="font-semibold text-ink pt-0.5">{selected.termAvgPct}%</dd>
            </div>
            <div className="py-2.5">
              <dt className="text-xs text-ink-muted">Transport Route</dt>
              <dd className="font-semibold text-ink pt-0.5">{selected.transportRoute}</dd>
            </div>
            <div className="py-2.5">
              <dt className="text-xs text-ink-muted">Class Teacher Note</dt>
              <dd className="font-medium text-ink-secondary pt-0.5">
                Strong analytical reasoning; mentor for Math Olympiad.
              </dd>
            </div>
          </dl>
          <Link href="/teacher/messages">
            <Button variant="primary">Message Parent</Button>
          </Link>
        </Card>
      </div>
    </AppShell>
  );
}

