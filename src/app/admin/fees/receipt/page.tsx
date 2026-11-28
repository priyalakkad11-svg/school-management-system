import { PrintView } from "@/components/templates/PrintView";
import { StatusBadge } from "@/components/ui/primitives";
import { FinanceService } from "@/services/school.service";
import { formatInr } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FeeReceiptPrintPage() {
  const all = await FinanceService.listTransactions();
  const tx = all[0] ?? {
    id: "rcp",
    receiptNo: "RCP-GIA01-2627-0001",
    admissionId: "ADM-2026-0142",
    studentName: "Aarav Sharma",
    className: "Class 10-A",
    feeHead: "Academic Tuition & Fees",
    amount: 18500,
    discount: 0,
    netPaid: 18500,
    mode: "UPI",
    date: "Today",
    status: "Paid" as const,
  };

  return (
    <PrintView
      role="admin"
      title="Official Fee Payment Receipt"
      subtitle={`Receipt #${tx.receiptNo} • Date: ${tx.date}`}
      documentHeading={`FEE RECEIPT — ${tx.receiptNo}`}
      backHref="/admin/fees/collect"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-b border-line pb-4">
        <div>
          <div className="text-ink-secondary">Received From</div>
          <div className="font-bold text-ink">{tx.studentName} ({tx.admissionId})</div>
          <div className="text-xs text-ink-secondary">Class {tx.className}</div>
        </div>
        <div className="sm:text-right">
          <div className="text-ink-secondary">Payment Mode &amp; Date</div>
          <div className="font-bold text-ink">{tx.mode} • {tx.date}</div>
          <div className="pt-1">
            <StatusBadge tone="success">{tx.status}</StatusBadge>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between py-2 border-b border-line">
          <span>{tx.feeHead}</span>
          <span className="font-semibold">{formatInr(tx.amount)}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-line text-success">
          <span>Merit / Sibling Scholarship Waiver (10%)</span>
          <span className="font-semibold">- {formatInr(tx.discount)}</span>
        </div>
        <div className="flex justify-between pt-2 text-base font-bold text-ink">
          <span>Total Paid</span>
          <span>{formatInr(tx.netPaid)}</span>
        </div>
      </div>
    </PrintView>
  );
}

