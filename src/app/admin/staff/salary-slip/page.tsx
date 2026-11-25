import { PrintView } from "@/components/templates/PrintView";
import { StatusBadge } from "@/components/ui/primitives";
import { MOCK_PAYROLL } from "@/mocks/school.data";
import { formatInr } from "@/lib/utils";

export default function SalarySlipPrintPage() {
  const slip = MOCK_PAYROLL[0];
  const gross = slip.basic + slip.hra + slip.allowance;
  const totalDeduct = slip.pf + slip.tds + slip.pt;

  return (
    <PrintView
      role="admin"
      title="Employee Salary Slip"
      subtitle={`Pay Period: ${slip.month} • Ref: ${slip.bankRef}`}
      documentHeading="OFFICIAL PAYSLIP — NOVEMBER 2026"
      backHref="/admin/staff/payroll"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-b border-line pb-4">
        <div>
          <div className="text-ink-secondary">Employee Name</div>
          <div className="font-bold text-ink">{slip.name} ({slip.empId})</div>
          <div className="text-xs text-ink-secondary pt-0.5">{slip.designation}</div>
        </div>
        <div className="sm:text-right">
          <div className="text-ink-secondary">Bank Disbursement</div>
          <div className="font-bold text-ink">HDFC •••• 4910 • {slip.bankRef}</div>
          <div className="pt-1">
            <StatusBadge tone="success">{slip.status}</StatusBadge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div className="rounded-md border border-line p-4 flex flex-col gap-2">
          <h3 className="font-bold text-ink pb-1 border-b border-line">Earnings</h3>
          <div className="flex justify-between"><span>Basic Pay</span><span className="font-semibold">{formatInr(slip.basic)}</span></div>
          <div className="flex justify-between"><span>House Rent Allowance (HRA)</span><span className="font-semibold">{formatInr(slip.hra)}</span></div>
          <div className="flex justify-between"><span>Special Academic Allowance</span><span className="font-semibold">{formatInr(slip.allowance)}</span></div>
          <div className="flex justify-between pt-2 border-t border-line font-bold text-ink">
            <span>Gross Earnings</span><span>{formatInr(gross)}</span>
          </div>
        </div>

        <div className="rounded-md border border-line p-4 flex flex-col gap-2">
          <h3 className="font-bold text-ink pb-1 border-b border-line">Deductions</h3>
          <div className="flex justify-between"><span>Provident Fund (PF)</span><span className="font-semibold">{formatInr(slip.pf)}</span></div>
          <div className="flex justify-between"><span>Income Tax (TDS)</span><span className="font-semibold">{formatInr(slip.tds)}</span></div>
          <div className="flex justify-between"><span>Professional Tax (PT)</span><span className="font-semibold">{formatInr(slip.pt)}</span></div>
          <div className="flex justify-between pt-2 border-t border-line font-bold text-ink">
            <span>Total Deductions</span><span>{formatInr(totalDeduct)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-brand-soft p-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-brand">Net Salary Paid</span>
        <span className="text-2xl font-bold text-ink">{formatInr(slip.netPay)}</span>
      </div>
    </PrintView>
  );
}

