export interface PricingSlab {
  min: number;
  max: number | null;
  price_per_student_month: number;
}

export interface PriceCalculationInput {
  slabs: PricingSlab[];
  studentCount: number;
  billingCycle: "monthly" | "yearly";
  yearlyDiscountPct: number;
  setupFeeInr: number;
  includeSetupFee: boolean;
  gstPct: number;
  coupon?: {
    code: string;
    discountType: "percent" | "amount";
    discountValue: number;
  } | null;
}

export interface PriceCalculationResult {
  perStudentMonthlyInr: number;
  months: number;
  baseSubscriptionInr: number;
  yearlyDiscountInr: number;
  setupFeeInr: number;
  subtotalBeforeCouponInr: number;
  couponDiscountInr: number;
  taxableSubtotalInr: number;
  gstPct: number;
  gstAmountInr: number;
  totalPayableInr: number;
  monthlyEquivalentMrrInr: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function resolveSlabRate(slabs: PricingSlab[], studentCount: number): number {
  const count = Math.max(1, Math.floor(studentCount));
  const sorted = [...slabs].sort((a, b) => a.min - b.min);
  const match =
    sorted.find((s) => count >= s.min && (s.max === null || count <= s.max)) ??
    sorted[sorted.length - 1];
  return match?.price_per_student_month ?? 45;
}

export function calculateSaaSPrice(input: PriceCalculationInput): PriceCalculationResult {
  const count = Math.max(1, Math.floor(input.studentCount));
  const perStudentMonthlyInr = resolveSlabRate(input.slabs, count);
  const months = input.billingCycle === "yearly" ? 12 : 1;
  const grossCycleBase = round2(perStudentMonthlyInr * count * months);

  const yearlyDiscountInr =
    input.billingCycle === "yearly"
      ? round2(grossCycleBase * (Math.max(0, Math.min(80, input.yearlyDiscountPct)) / 100))
      : 0;

  const baseSubscriptionInr = round2(grossCycleBase - yearlyDiscountInr);
  const setupFeeInr = input.includeSetupFee ? round2(Math.max(0, input.setupFeeInr)) : 0;
  const subtotalBeforeCouponInr = round2(baseSubscriptionInr + setupFeeInr);

  let couponDiscountInr = 0;
  if (input.coupon) {
    if (input.coupon.discountType === "percent") {
      couponDiscountInr = round2(
        subtotalBeforeCouponInr * (Math.max(0, Math.min(100, input.coupon.discountValue)) / 100),
      );
    } else {
      couponDiscountInr = round2(Math.min(subtotalBeforeCouponInr, Math.max(0, input.coupon.discountValue)));
    }
  }

  const taxableSubtotalInr = round2(Math.max(0, subtotalBeforeCouponInr - couponDiscountInr));
  const gstPct = round2(Math.max(0, input.gstPct));
  const gstAmountInr = round2(taxableSubtotalInr * (gstPct / 100));
  const totalPayableInr = round2(taxableSubtotalInr + gstAmountInr);
  const monthlyEquivalentMrrInr = round2(baseSubscriptionInr / months);

  return {
    perStudentMonthlyInr,
    months,
    baseSubscriptionInr,
    yearlyDiscountInr,
    setupFeeInr,
    subtotalBeforeCouponInr,
    couponDiscountInr,
    taxableSubtotalInr,
    gstPct,
    gstAmountInr,
    totalPayableInr,
    monthlyEquivalentMrrInr,
  };
}

export function calculateProration(params: {
  oldMonthlyRateInr: number;
  newMonthlyRateInr: number;
  remainingDays: number;
  totalCycleDays: number;
}): {
  deltaInr: number;
  isUpgrade: boolean;
  creditNoteAmountInr: number;
} {
  const ratio =
    params.totalCycleDays > 0
      ? Math.max(0, Math.min(1, params.remainingDays / params.totalCycleDays))
      : 0;
  const monthsEquivalent = (params.totalCycleDays / 30) * ratio;
  const rawDelta = round2((params.newMonthlyRateInr - params.oldMonthlyRateInr) * Math.max(0.05, monthsEquivalent));
  return {
    deltaInr: rawDelta,
    isUpgrade: rawDelta > 0,
    creditNoteAmountInr: rawDelta < 0 ? Math.abs(rawDelta) : 0,
  };
}

export function getIndianFinancialYear(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = fyStart + 1;
  return `${String(fyStart).slice(-2)}${String(fyEnd).slice(-2)}`;
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}
