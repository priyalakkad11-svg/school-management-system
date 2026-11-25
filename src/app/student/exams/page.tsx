"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/overlays";

const EXAMS = [
  { date: "08 Dec 2026", day: "Tuesday", subject: "Mathematics (041)", time: "09:00 – 12:00", room: "Hall A • Seat 01", max: "80 + 20" },
  { date: "10 Dec 2026", day: "Thursday", subject: "Science (Physics/Chem/Bio)", time: "09:00 – 12:00", room: "Hall A • Seat 01", max: "80 + 20" },
  { date: "12 Dec 2026", day: "Saturday", subject: "English Language & Lit", time: "09:00 – 12:00", room: "Hall A • Seat 01", max: "80 + 20" },
  { date: "15 Dec 2026", day: "Tuesday", subject: "Social Science", time: "09:00 – 12:00", room: "Hall A • Seat 01", max: "80 + 20" },
  { date: "17 Dec 2026", day: "Thursday", subject: "Computer Applications", time: "09:00 – 11:30", room: "CS Lab 1", max: "50 + 50" },
];

export default function StudentExamsPage() {
  const [guidelinesOpen, setGuidelinesOpen] = React.useState(false);

  return (
    <AppShell
      role="student"
      title="Upcoming Exam Schedule"
      subtitle="Mid-Term Examination Timetable — Class 10–A (Dec 2026)"
    >
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">
            Mid-Term Examination Timetable — Class 10–A (Dec 2026)
          </h2>
          <span className="text-xs text-ink-muted">{EXAMS.length} entries</span>
        </div>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Mid-term exam schedule">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-subtle border-b border-line">
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Date</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Day</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Subject</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Timing</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Room / Seat</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-ink-secondary">Max Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {EXAMS.map((ex) => (
                <tr key={ex.date} className="hover:bg-subtle/60">
                  <td className="py-3.5 px-4 text-sm font-bold text-ink">{ex.date}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{ex.day}</td>
                  <td className="py-3.5 px-4 text-sm text-ink">{ex.subject}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{ex.time}</td>
                  <td className="py-3.5 px-4 text-sm text-ink-secondary">{ex.room}</td>
                  <td className="py-3.5 px-4 text-sm text-ink">{ex.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => window.print()}>
          Download Admit Card PDF
        </Button>
        <Button variant="outline" onClick={() => setGuidelinesOpen(true)}>
          View Exam Guidelines
        </Button>
      </div>

      <Modal
        open={guidelinesOpen}
        onClose={() => setGuidelinesOpen(false)}
        title="Examination Hall Guidelines"
      >
        <ul className="flex flex-col gap-2 text-sm text-ink-secondary list-disc pl-5">
          <li>Carry your printed Admit Card and Student RFID ID Card.</li>
          <li>Report to Hall A at least 20 minutes prior to 09:00 AM.</li>
          <li>Programmable calculators and smartwatches are prohibited.</li>
        </ul>
      </Modal>
    </AppShell>
  );
}
