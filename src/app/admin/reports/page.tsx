"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const REPORT_CATEGORIES = [
  {
    category: "Academic & Examination",
    tone: "primary" as const,
    reports: [
      { title: "Consolidated Term 1 Marksheet (CSV / PDF)", href: "/admin/exams/analytics" },
      { title: "Class-wise Pass & Distinction Benchmark", href: "/admin/exams/results" },
      { title: "Student Attendance Below 85% List", href: "/admin/attendance/reports" },
    ],
  },
  {
    category: "Finance & Payroll",
    tone: "success" as const,
    reports: [
      { title: "Daily Fee Collection & GST Ledger", href: "/admin/fees/reports" },
      { title: "Pending Fee Defaulters Aging Report", href: "/admin/fees/defaulters" },
      { title: "Monthly Payroll & PF/TDS Register", href: "/admin/staff/payroll" },
    ],
  },
  {
    category: "Operations & Compliance",
    tone: "info" as const,
    reports: [
      { title: "Transport Route Occupancy & Fleet Audit", href: "/admin/transport/routes" },
      { title: "Library Overdue & Lost Book Valuation", href: "/admin/library/members" },
      { title: "RBAC Security & Activity Audit Export", href: "/admin/audit-logs" },
    ],
  },
];

export default function ReportsCenterPage() {
  const { showToast } = useToast();

  return (
    <AppShell
      role="admin"
      title="Reports Center & Compliance Exports"
      subtitle="One-click CSV, Excel, and PDF regulatory reports across every ERP department"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {REPORT_CATEGORIES.map((group) => (
          <Card key={group.category} className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-line">
              <h2 className="text-base font-bold text-ink">{group.category}</h2>
              <StatusBadge tone={group.tone}>{group.reports.length} reports</StatusBadge>
            </div>
            <ul className="flex flex-col gap-3">
              {group.reports.map((rep) => (
                <li
                  key={rep.title}
                  className="rounded-md bg-subtle p-3.5 flex flex-col gap-2"
                >
                  <div className="text-sm font-semibold text-ink">{rep.title}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={rep.href}>
                      <Button size="sm" variant="outline">
                        Preview Report
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => showToast(`Exported "${rep.title}".`)}
                    >
                      Download CSV
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

