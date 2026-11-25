import { DashboardPage } from "@/components/templates/DashboardPage";
import { AcademicService } from "@/services/school.service";

export default async function TeacherDashboardPage() {
  await AcademicService.listExams();

  return (
    <DashboardPage
      role="teacher"
      title="Teacher Dashboard"
      subtitle="Mrs. Kavita Nair • Senior PGT Mathematics • Class Teacher 10-A"
      kpis={[
        {
          title: "Assigned Classes",
          value: "5 Sections",
          delta: "Grades 9, 10 & 12",
          deltaTone: "success",
        },
        {
          title: "Today's Periods",
          value: "4 / 6 Done",
          delta: "Next: 10-A @ 11:30 AM",
          deltaTone: "success",
        },
        {
          title: "Pending Homework",
          value: "18 Submissions",
          delta: "2 assignments to grade",
          deltaTone: "warning",
        },
        {
          title: "My Leave Balance",
          value: "11 Days",
          delta: "Casual + Medical",
          deltaTone: "success",
        },
      ]}
      tableTitle="Today's Teaching Schedule"
      tableCountLabel="4 records shown"
      tableHeaders={["Period", "Time", "Class & Section", "Subject", "Room", "Attendance"]}
      tableRows={[
        {
          id: "p1",
          cells: ["Period 1", "08:30 – 09:15", "Class 10–A", "Mathematics", "Room 204"],
          badge: { label: "Marked (38/40)", tone: "success" },
          href: "/teacher/attendance",
        },
        {
          id: "p2",
          cells: ["Period 2", "09:20 – 10:05", "Class 9–B", "Mathematics", "Room 108"],
          badge: { label: "Marked (36/36)", tone: "success" },
          href: "/teacher/attendance",
        },
        {
          id: "p4",
          cells: ["Period 4", "11:30 – 12:15", "Class 12–Sci", "Calculus", "Room 301"],
          badge: { label: "Upcoming", tone: "info" },
          href: "/teacher/classes",
        },
        {
          id: "p6",
          cells: ["Period 6", "01:45 – 02:30", "Class 10–C", "Mathematics", "Room 206"],
          badge: { label: "Pending", tone: "warning" },
          href: "/teacher/attendance",
        },
      ]}
      bottomNote="Recent Department Notices & Tasks: Mid-Term Math Question Paper due to Exam Cell by Nov 29 • Science Expo Mentors meeting at 3:00 PM"
    />
  );
}

