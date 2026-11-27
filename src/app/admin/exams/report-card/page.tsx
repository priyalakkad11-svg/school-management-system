import { PrintView } from "@/components/templates/PrintView";
import { StatusBadge } from "@/components/ui/primitives";

const SUBJECT_MARKS = [
  { sub: "Mathematics (041)", th: 74, pr: 19, total: 93, grade: "A+" },
  { sub: "Science (086)", th: 72, pr: 19, total: 91, grade: "A+" },
  { sub: "English Lang & Lit (184)", th: 70, pr: 18, total: 88, grade: "A" },
  { sub: "Social Science (087)", th: 71, pr: 18, total: 89, grade: "A" },
  { sub: "Computer Applications (165)", th: 48, pr: 49, total: 97, grade: "A+" },
];

export default function AdminReportCardPrintPage() {
  return (
    <PrintView
      role="admin"
      title="Official Student Report Card (Print / PDF)"
      subtitle="Term 1 Assessment • Class 10–A"
      documentHeading="OFFICIAL ACADEMIC TRANSCRIPT — TERM 1"
      backHref="/admin/exams/results"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border-b border-line pb-4">
        <div>
          <div><span className="text-ink-secondary">Student:</span> <strong>Aarav Rajesh Sharma</strong></div>
          <div><span className="text-ink-secondary">Admission ID:</span> ADM-2026-0142 • Roll #01</div>
        </div>
        <div className="sm:text-right">
          <div><span className="text-ink-secondary">Class &amp; Section:</span> <strong>Class 10–A</strong></div>
          <div><span className="text-ink-secondary">Attendance:</span> 138 / 143 Days (96.5%)</div>
        </div>
      </div>

      <div className="w-full max-w-full overflow-x-auto" tabIndex={0} role="region" aria-label="Official marks table">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-subtle border-b border-line">
              <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Subject</th>
              <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Theory</th>
              <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Internal</th>
              <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Total (100)</th>
              <th className="py-2.5 px-3 text-xs font-semibold text-ink-secondary">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {SUBJECT_MARKS.map((m) => (
              <tr key={m.sub}>
                <td className="py-3 px-3 text-sm font-medium text-ink">{m.sub}</td>
                <td className="py-3 px-3 text-sm text-ink-secondary">{m.th}</td>
                <td className="py-3 px-3 text-sm text-ink-secondary">{m.pr}</td>
                <td className="py-3 px-3 text-sm font-bold text-ink">{m.total}</td>
                <td className="py-3 px-3">
                  <StatusBadge tone="success">{m.grade}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-brand-soft p-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span><strong>Grand Total:</strong> 458 / 500 (91.6%) • Rank #2 / 40</span>
        <StatusBadge tone="success">Promoted / Distinction</StatusBadge>
      </div>
    </PrintView>
  );
}

