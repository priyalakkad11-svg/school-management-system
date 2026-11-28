import { DashboardPage } from "@/components/templates/DashboardPage";
import { AcademicService, StudentService } from "@/services/school.service";
import { listPortalAcademicDataAction } from "@/app/actions/academics-finance.actions";

export default async function StudentDashboardPage() {
  const [students, exams, portal] = await Promise.all([
    StudentService.list(),
    AcademicService.listExams(),
    listPortalAcademicDataAction(),
  ]);
  const stu = students[0];
  const homework = portal.ok && portal.data ? portal.data.homework : [];
  const nextExam = exams[0];

  return (
    <DashboardPage
      role="student"
      title="Student Dashboard"
      subtitle={
        stu
          ? `${stu.name} • ${stu.className}–${stu.section} • Roll #${stu.rollNo}`
          : "Student Portal"
      }
      kpis={[
        {
          title: "My Attendance",
          value: stu ? `${stu.attendancePct}%` : "95%",
          delta: "Current Academic Year",
          deltaTone: "success",
        },
        {
          title: "Assignments",
          value: `${homework.length} Active`,
          delta: homework[0]?.title ?? "Up to date",
          deltaTone: homework.length > 0 ? "warning" : "success",
        },
        {
          title: "Next Exam",
          value: nextExam ? nextExam.dateWindow : "TBA",
          delta: nextExam ? nextExam.name : "No scheduled exam",
          deltaTone: "info",
        },
        {
          title: "Fee Balance",
          value: stu ? `₹${stu.feeDueAmount.toLocaleString("en-IN")}` : "₹0",
          delta: stu && stu.feeDueAmount > 0 ? "Pending tuition balance" : "Cleared",
          deltaTone: stu && stu.feeDueAmount > 0 ? "warning" : "success",
        },
      ]}
      tableTitle="Active Homework & Exam Schedule"
      tableCountLabel={`${homework.length + exams.slice(0, 2).length} entries`}
      tableHeaders={["Item", "Type", "Due / Window", "Status"]}
      tableRows={[
        ...homework.slice(0, 3).map((h) => ({
          id: h.id,
          cells: [h.title, "Homework", h.due_date],
          badge: { label: h.status, tone: "warning" as const },
          href: "/student/homework",
        })),
        ...exams.slice(0, 2).map((ex) => ({
          id: ex.id,
          cells: [ex.name, "Examination", ex.dateWindow],
          badge: { label: ex.status, tone: "info" as const },
          href: "/student/results",
        })),
      ]}
    />
  );
}

