import { DashboardPage } from "@/components/templates/DashboardPage";

export default function ResultAnalyticsPage() {
  return (
    <DashboardPage
      role="admin"
      title="Result Analytics & Subject Toppers"
      subtitle="Cohort performance metrics, subject pass rates, and distinction benchmarks"
      kpis={[
        { title: "Overall Pass Rate", value: "97.8%", delta: "+1.9% vs Term 1 last year", deltaTone: "success" },
        { title: "Distinctions (>90%)", value: "412", delta: "28.4% of senior cohort", deltaTone: "success" },
        { title: "Top Subject Avg", value: "88.2%", delta: "Computer Science (CS-083)", deltaTone: "info" },
        { title: "Remedial Flagged", value: "19", delta: "Extra coaching scheduled", deltaTone: "warning" },
      ]}
      tableTitle="Grade-wise Examination Performance Breakdown"
      tableCountLabel="4 cohorts shown"
      tableHeaders={["Cohort", "Appeared", "Average %", "Distinctions", "Topper", "Status"]}
      tableRows={[
        { id: "an-1", cells: ["Class 10–A", "40", "86.4%", "16", "Ananya Verma (96.4%)"], badge: { label: "Verified", tone: "success" } },
        { id: "an-2", cells: ["Class 10–B", "38", "81.9%", "11", "Ishita Rao (93.1%)"], badge: { label: "Verified", tone: "success" } },
        { id: "an-3", cells: ["Class 12–Sci", "36", "89.1%", "19", "Pranav Nair (97.2%)"], badge: { label: "Top Cohort", tone: "primary" } },
        { id: "an-4", cells: ["Class 9–B", "36", "78.4%", "8", "Rohan Mehta (91.8%)"], badge: { label: "Moderation Done", tone: "info" } },
      ]}
    />
  );
}

