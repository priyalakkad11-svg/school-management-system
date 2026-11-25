import { DashboardPage } from "@/components/templates/DashboardPage";

export default function ParentDashboardPage() {
  return (
    <DashboardPage
      role="parent"
      title="Parent Dashboard — Overview"
      subtitle="Mr. Rajesh Sharma • Viewing Aarav Sharma (10–A) & Diya Sharma (6–C)"
      kpis={[
        { title: "Aarav Attendance", value: "96.5%", delta: "Present Today @ 08:22 AM", deltaTone: "success" },
        { title: "Term 1 Aggregate", value: "91.6%", delta: "Rank #2 in Class 10–A", deltaTone: "success" },
        { title: "Fee Balance", value: "₹18,500", delta: "Term 3 due Jan 10, 2027", deltaTone: "warning" },
        { title: "Unread Notices", value: "3 New", delta: "Science Expo + Exam Dates", deltaTone: "info" },
      ]}
      tableTitle="Recent Activity Across Both Enrolled Children"
      tableCountLabel="4 entries"
      tableHeaders={["Child", "Module", "Update", "Date", "Status"]}
      tableRows={[
        {
          id: "pa-1",
          cells: ["Aarav Sharma (10–A)", "Attendance", "Checked in via RFID Gate #1 at 08:22 AM", "25 Nov 2026"],
          badge: { label: "Present", tone: "success" },
          href: "/parent/attendance",
        },
        {
          id: "pa-2",
          cells: ["Diya Sharma (6–C)", "Homework", "English Book Review due tomorrow", "26 Nov 2026"],
          badge: { label: "Pending", tone: "warning" },
          href: "/parent/homework",
        },
        {
          id: "pa-3",
          cells: ["Aarav Sharma (10–A)", "Transport", "Bus Route #04 boarded at Oakridge Stop", "25 Nov 2026"],
          badge: { label: "On Time", tone: "info" },
        },
        {
          id: "pa-4",
          cells: ["Diya Sharma (6–C)", "Fees", "Term 2 Fee Receipt RCP-2026–4411 issued", "18 Nov 2026"],
          badge: { label: "Paid", tone: "success" },
          href: "/parent/fees",
        },
      ]}
    />
  );
}

