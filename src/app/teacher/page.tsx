import { DashboardPage } from "@/components/templates/DashboardPage";
import { AcademicService, StaffService } from "@/services/school.service";
import { listPortalAcademicDataAction } from "@/app/actions/academics-finance.actions";

export default async function TeacherDashboardPage() {
  const [teachers, exams, portal] = await Promise.all([
    StaffService.listTeachers(),
    AcademicService.listExams(),
    listPortalAcademicDataAction(),
  ]);
  const teacher = teachers[0];
  const classes = portal.ok && portal.data ? portal.data.classes : [];
  const homework = portal.ok && portal.data ? portal.data.homework : [];
  const notices = portal.ok && portal.data ? portal.data.notices : [];

  return (
    <DashboardPage
      role="teacher"
      title="Teacher Dashboard"
      subtitle={
        teacher
          ? `${teacher.name} • ${teacher.department} • ${teacher.classesAssigned}`
          : "Faculty Workspace"
      }
      kpis={[
        {
          title: "Active Classes",
          value: `${classes.length} Classes`,
          delta: classes.slice(0, 3).map((c) => c.name).join(", ") || "Configured",
          deltaTone: "success",
        },
        {
          title: "Homework Sets",
          value: `${homework.length} Published`,
          delta: homework[0]?.title ?? "Assign homework",
          deltaTone: "info",
        },
        {
          title: "Upcoming Exams",
          value: `${exams.length} Scheduled`,
          delta: exams[0]?.name ?? "Exam Cell synced",
          deltaTone: "warning",
        },
        {
          title: "School Notices",
          value: `${notices.length} Active`,
          delta: notices[0]?.title ?? "No active circulars",
          deltaTone: "success",
        },
      ]}
      tableTitle="Active Classes & Examination Schedule"
      tableCountLabel={`${classes.slice(0, 5).length} records shown`}
      tableHeaders={["Class", "Grade Order", "Status"]}
      tableRows={classes.slice(0, 5).map((c) => ({
        id: c.id,
        cells: [c.name, `Level ${c.grade_order}`],
        badge: { label: "Attendance Open", tone: "success" as const },
        href: "/teacher/attendance",
      }))}
      bottomNote={notices[0] ? `Latest Notice: ${notices[0].title}` : undefined}
    />
  );
}

