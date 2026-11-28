import { DashboardPage } from "@/components/templates/DashboardPage";
import { StudentService } from "@/services/school.service";
import { listPortalAcademicDataAction } from "@/app/actions/academics-finance.actions";

export default async function ParentDashboardPage() {
  const [students, portal] = await Promise.all([
    StudentService.list(),
    listPortalAcademicDataAction(),
  ]);
  const primary = students[0];
  const notices = portal.ok && portal.data ? portal.data.notices : [];
  const receipts = portal.ok && portal.data ? portal.data.receipts : [];
  const totalBalance = students.reduce((s, stu) => s + stu.feeDueAmount, 0);

  return (
    <DashboardPage
      role="parent"
      title="Parent Dashboard — Overview"
      subtitle={
        primary
          ? `${primary.parentName} • Viewing ${students.slice(0, 2).map((s) => `${s.name} (${s.className}–${s.section})`).join(" & ")}`
          : "Parent Portal"
      }
      kpis={[
        {
          title: "Primary Ward Attendance",
          value: primary ? `${primary.attendancePct}%` : "95%",
          delta: primary?.name ?? "Enrolled",
          deltaTone: "success",
        },
        {
          title: "Academic Standing",
          value: primary ? `${primary.termAvgPct}%` : "88%",
          delta: `${students.length} enrolled profile(s)`,
          deltaTone: "success",
        },
        {
          title: "Total Fee Balance",
          value: `₹${totalBalance.toLocaleString("en-IN")}`,
          delta: totalBalance > 0 ? "Online payment available" : "All cleared",
          deltaTone: totalBalance > 0 ? "warning" : "success",
        },
        {
          title: "Official Circulars",
          value: `${notices.length} Active`,
          delta: notices[0]?.title ?? "Up to date",
          deltaTone: "info",
        },
      ]}
      tableTitle="Recent Student Fees & Circular Updates"
      tableCountLabel={`${receipts.slice(0, 3).length + notices.slice(0, 2).length} entries`}
      tableHeaders={["Item", "Module", "Reference", "Status"]}
      tableRows={[
        ...receipts.slice(0, 3).map((r) => {
          const stu = Array.isArray(r.students) ? r.students[0] : r.students;
          return {
            id: r.id,
            cells: [stu?.full_name ?? "Student", "Fees", `${r.receipt_number} • ₹${Number(r.amount_inr).toLocaleString("en-IN")}`],
            badge: { label: "Paid", tone: "success" as const },
            href: "/parent/fees",
          };
        }),
        ...notices.slice(0, 2).map((n) => ({
          id: n.id,
          cells: [n.title, "Circular", n.category],
          badge: { label: "Published", tone: "info" as const },
          href: "/parent/notices",
        })),
      ]}
    />
  );
}

