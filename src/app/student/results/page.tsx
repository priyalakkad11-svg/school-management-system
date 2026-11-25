"use client";

import { DashboardPage } from "@/components/templates/DashboardPage";
import { Button } from "@/components/ui/primitives";

export default function StudentResultsPage() {
  return (
    <DashboardPage
      role="student"
      title="Academic Results & Report Card"
      subtitle="Term 1 Official Report Card — Aarav Sharma (Class 10–A)"
      kpis={[
        { title: "Term 1 Percentage", value: "91.6%", delta: "Grade A+ • Distinction", deltaTone: "success" },
        { title: "Class Rank", value: "#2 / 40", delta: "Top 5% of Class 10–A", deltaTone: "success" },
        { title: "Total Marks", value: "458 / 500", delta: "All subjects cleared", deltaTone: "success" },
        { title: "Teacher Remark", value: "Exemplary", delta: "Consistent excellence", deltaTone: "success" },
      ]}
      tableTitle="Term 1 Official Report Card — Aarav Sharma"
      tableCountLabel="5 entries"
      tableHeaders={["Subject", "Theory (80)", "Internal (20)", "Total (100)", "Remarks", "Grade"]}
      tableRows={[
        { id: "r1", cells: ["Mathematics", "74", "19", "93", "Top Scorer"], badge: { label: "A+", tone: "success" } },
        { id: "r2", cells: ["Science", "72", "19", "91", "Excellent lab work"], badge: { label: "A+", tone: "success" } },
        { id: "r3", cells: ["English", "70", "18", "88", "Strong writing"], badge: { label: "A", tone: "success" } },
        { id: "r4", cells: ["Social Science", "71", "18", "89", "Very good"], badge: { label: "A", tone: "success" } },
        { id: "r5", cells: ["Computer Science", "48", "49", "97", "Outstanding"], badge: { label: "A+", tone: "success" } },
      ]}
      actions={
        <Button variant="primary" onClick={() => window.print()}>
          Print / Download Signed Report Card
        </Button>
      }
    />
  );
}
