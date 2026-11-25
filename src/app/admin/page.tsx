import { DashboardPage } from "@/components/templates/DashboardPage";
import { AcademicService } from "@/services/school.service";

export default async function AdminDashboardPage() {
  const chartData = await AcademicService.getDashboardTrend();

  return (
    <DashboardPage
      role="admin"
      title="Super Admin Dashboard"
      subtitle="Greenwood International Academy • Academic Year 2026–27"
      kpis={[
        { title: "Total Students", value: "2,480", delta: "+124 new admissions", deltaTone: "success" },
        { title: "Teachers & Staff", value: "184", delta: "142 Faculty • 42 Staff", deltaTone: "success" },
        { title: "Today's Attendance", value: "95.4%", delta: "2,366 Present • 114 Absent", deltaTone: "success" },
        { title: "Fees Collected (YTD)", value: "₹1.84 Cr", delta: "91.2% of Term 2 Target", deltaTone: "success" },
      ]}
      chartTitle="Monthly Fee Collection & Attendance Trend (2026)"
      chartData={chartData}
      chartCaption="Indigo: Fee Collection (₹ Lakhs) • Teal: Avg Student Attendance %"
      noticesTitle="Campus Notices & Alerts"
      notices={[
        { id: "n1", title: "Mid-Term Exam Schedule Published", tag: "Academic", tone: "info", href: "/admin/exams" },
        { id: "n2", title: "Pending Fee Reminders Sent (142)", tag: "Finance", tone: "warning", href: "/admin/fees/defaulters" },
        { id: "n3", title: "3 Teacher Leave Requests Pending", tag: "HR", tone: "danger", href: "/admin/staff/leave-requests" },
        { id: "n4", title: "Annual Science Expo on Dec 12", tag: "Event", tone: "success", href: "/admin/communication/events" },
      ]}
      tableTitle="Recent Admissions & Fee Transactions"
      tableCountLabel="3 entries"
      tableHeaders={["Student / Reference", "Class", "Module", "Timestamp", "Amount / Status"]}
      tableRows={[
        {
          id: "adm-t1",
          cells: ["Aarav Sharma (RCP-4410)", "10–A", "Fee Collection", "10:18 AM"],
          badge: { label: "₹18,500 Paid", tone: "success" },
          href: "/admin/fees/receipt",
        },
        {
          id: "adm-t2",
          cells: ["Naina Kulkarni (ENQ-902)", "6–B", "Admission Review", "09:45 AM"],
          badge: { label: "Interview Scheduled", tone: "info" },
          href: "/admin/students/applications",
        },
        {
          id: "adm-t3",
          cells: ["Rohan Verma (ADM-2026-991)", "8–A", "Transfer Cert.", "Yesterday"],
          badge: { label: "Approved", tone: "primary" },
          href: "/admin/documents",
        },
      ]}
    />
  );
}

