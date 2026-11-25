import { DashboardPage } from "@/components/templates/DashboardPage";

export default function StudentAttendancePage() {
  return (
    <DashboardPage
      role="student"
      title="My Attendance Record"
      subtitle="Monthly attendance summary and approved leave breakdown for AY 2026–27"
      kpis={[
        { title: "Present Days", value: "138", delta: "96.5% overall", deltaTone: "success" },
        { title: "Absent Days", value: "3", delta: "Approved medical leave", deltaTone: "success" },
        { title: "Late Arrivals", value: "2", delta: "Under 10 mins", deltaTone: "info" },
        { title: "Working Days", value: "143", delta: "Apr – Nov 2026", deltaTone: "success" },
      ]}
      tableTitle="Monthly Attendance Summary (2026)"
      tableCountLabel="4 entries"
      tableHeaders={["Month", "Working Days", "Present", "Absent", "Late", "Percentage"]}
      tableRows={[
        {
          id: "att-nov",
          cells: ["November 2026", "19", "19", "0", "0"],
          badge: { label: "100%", tone: "success" },
        },
        {
          id: "att-oct",
          cells: ["October 2026", "22", "21", "1", "0"],
          badge: { label: "95.5%", tone: "success" },
        },
        {
          id: "att-sep",
          cells: ["September 2026", "24", "23", "0", "1"],
          badge: { label: "95.8%", tone: "success" },
        },
        {
          id: "att-aug",
          cells: ["August 2026", "23", "21", "2", "0"],
          badge: { label: "91.3%", tone: "warning" },
        },
      ]}
    />
  );
}
