import { PrintView } from "@/components/templates/PrintView";
import { StatusBadge } from "@/components/ui/primitives";

const PAPERS = [
  { date: "08 Dec 2026", sub: "Mathematics (041)", time: "09:00 – 12:00", seat: "Hall A • Seat 01" },
  { date: "10 Dec 2026", sub: "Science (086)", time: "09:00 – 12:00", seat: "Hall A • Seat 01" },
  { date: "12 Dec 2026", sub: "English Lang & Lit", time: "09:00 – 12:00", seat: "Hall A • Seat 01" },
  { date: "15 Dec 2026", sub: "Social Science", time: "09:00 – 12:00", seat: "Hall A • Seat 01" },
];

export default function AdminAdmitCardGeneratorPage() {
  return (
    <PrintView
      role="admin"
      title="Examination Admit Card Generator"
      subtitle="Hall Ticket with Seat Number, Exam Dates, and Principal Authorization"
      documentHeading="MID-TERM EXAMINATION ADMIT CARD — DEC 2026"
      backHref="/admin/exams"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-sm">
        <div>
          <div className="font-bold text-base text-ink">Aarav Rajesh Sharma</div>
          <div className="text-ink-secondary">Admission ID: ADM-2026-0142 • Class 10–A • Roll #01</div>
        </div>
        <StatusBadge tone="success">Fee Dues Cleared • Eligible</StatusBadge>
      </div>

      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Admit card exam dates">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-subtle border-b border-line">
              <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Exam Date</th>
              <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Subject</th>
              <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Window</th>
              <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Hall &amp; Seat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {PAPERS.map((p) => (
              <tr key={p.date}>
                <td className="py-2.5 px-3 text-sm font-semibold text-ink">{p.date}</td>
                <td className="py-2.5 px-3 text-sm text-ink">{p.sub}</td>
                <td className="py-2.5 px-3 text-sm text-ink-secondary">{p.time}</td>
                <td className="py-2.5 px-3 text-sm text-ink-secondary">{p.seat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PrintView>
  );
}

