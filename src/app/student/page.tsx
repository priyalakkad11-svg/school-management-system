import { DashboardPage } from "@/components/templates/DashboardPage";
import { StudentService } from "@/services/school.service";

export default async function StudentDashboardPage() {
  await StudentService.getById("ADM-2026-0142");

  return (
    <DashboardPage
      role="student"
      title="Student Dashboard"
      subtitle="Aarav Sharma • Class 10–A • Roll #01"
      kpis={[
        {
          title: "My Attendance",
          value: "96.5%",
          delta: "138 / 143 Days Present",
          deltaTone: "success",
        },
        {
          title: "Pending Homework",
          value: "2 Due",
          delta: "Math & Physics this week",
          deltaTone: "warning",
        },
        {
          title: "Next Exam",
          value: "Dec 08",
          delta: "Mid-Term Mathematics Paper",
          deltaTone: "info",
        },
        {
          title: "Fee Status",
          value: "₹0 Due",
          delta: "Term 2 Paid in Full",
          deltaTone: "success",
        },
      ]}
      tableTitle="Today's Timetable & Homework Reminders"
      tableCountLabel="4 entries"
      tableHeaders={["Time", "Subject", "Teacher", "Room", "Status"]}
      tableRows={[
        {
          id: "st-1",
          cells: ["08:30 – 09:15", "Mathematics", "Mrs. Kavita Nair", "Room 204"],
          badge: { label: "Completed", tone: "success" },
          href: "/student/timetable",
        },
        {
          id: "st-2",
          cells: ["09:20 – 10:05", "Physics", "Mr. Arjun Menon", "Lab 2"],
          badge: { label: "In Progress", tone: "primary" },
          href: "/student/homework",
        },
        {
          id: "st-3",
          cells: ["10:25 – 11:10", "English Literature", "Ms. Clara D'Souza", "Room 204"],
          badge: { label: "Upcoming", tone: "info" },
        },
        {
          id: "st-4",
          cells: ["11:30 – 12:15", "Computer Science", "Mr. Vikram Rao", "CS Lab 1"],
          badge: { label: "Upcoming", tone: "info" },
        },
      ]}
    />
  );
}
