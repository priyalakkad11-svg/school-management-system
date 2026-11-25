import { DashboardPage } from "@/components/templates/DashboardPage";

export default function AdminAttendanceReportsPage() {
  return (
    <DashboardPage
      role="admin"
      title="Attendance Analytics & Defaulter Reports"
      subtitle="Campus-wide attendance percentages, chronic absence alerts, and monthly summaries"
      kpis={[
        { title: "School Avg (YTD)", value: "95.4%", delta: "+1.2% vs last year", deltaTone: "success" },
        { title: "Present Today", value: "2,366 / 2,480", delta: "42 sections marked", deltaTone: "success" },
        { title: "Low Attendance (<85%)", value: "28", delta: "Parent SMS alerts active", deltaTone: "warning" },
        { title: "Pending Sections", value: "0", delta: "100% locked by 9:30 AM", deltaTone: "success" },
      ]}
      tableTitle="Section-wise Monthly Attendance Summary"
      tableCountLabel="4 wings shown"
      tableHeaders={["Class & Section", "Strength", "Avg Attendance", "Below 85% Count", "Status"]}
      tableRows={[
        { id: "ar-1", cells: ["Class 10–A", "40", "96.8%", "1"], badge: { label: "Healthy", tone: "success" } },
        { id: "ar-2", cells: ["Class 10–B", "38", "94.1%", "2"], badge: { label: "Healthy", tone: "success" } },
        { id: "ar-3", cells: ["Class 9–B", "36", "88.4%", "5"], badge: { label: "Watchlist", tone: "warning" } },
        { id: "ar-4", cells: ["Class 12–Sci", "36", "97.2%", "0"], badge: { label: "Exemplary", tone: "success" } },
      ]}
    />
  );
}

