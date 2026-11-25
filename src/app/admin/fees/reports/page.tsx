import { DashboardPage } from "@/components/templates/DashboardPage";
import { AcademicService } from "@/services/school.service";

export default async function AdminFeeReportsPage() {
  const chartData = await AcademicService.getDashboardTrend();

  return (
    <DashboardPage
      role="admin"
      title="Fee Collection Analytics & Reconciliation"
      subtitle="Monthly revenue breakdowns by UPI, NetBanking, Card, and Scholarship Waivers"
      kpis={[
        { title: "Collected (YTD)", value: "₹1.84 Cr", delta: "91.2% of AY target", deltaTone: "success" },
        { title: "Digital / UPI Share", value: "78.4%", delta: "Instant bank settlement", deltaTone: "success" },
        { title: "Outstanding Term Dues", value: "₹17.6 L", delta: "142 families pending", deltaTone: "warning" },
        { title: "Scholarships Awarded", value: "₹9.4 L", delta: "64 merit & EWS grants", deltaTone: "info" },
      ]}
      chartTitle="Monthly Fee Collection (₹ Lakhs) vs Attendance %"
      chartData={chartData}
      tableTitle="Payment Gateway & Ledger Reconciliation"
      tableCountLabel="3 channels reconciled"
      tableHeaders={["Payment Channel", "Transactions", "Gross Settled", "Refunds", "Status"]}
      tableRows={[
        { id: "ch-1", cells: ["Razorpay UPI (GPay / PhonePe)", "1,412", "₹1.18 Cr", "₹0"], badge: { label: "Reconciled", tone: "success" } },
        { id: "ch-2", cells: ["NEFT / NetBanking", "492", "₹44.2 L", "₹0"], badge: { label: "Reconciled", tone: "success" } },
        { id: "ch-3", cells: ["School Cash / POS Desk", "218", "₹21.8 L", "₹12,000"], badge: { label: "Audited", tone: "info" } },
      ]}
    />
  );
}

