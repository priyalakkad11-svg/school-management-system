"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  listPlansAndCouponsAction,
  upsertCouponAction,
  upsertSaasPlanAction,
  type SaasPlanDto,
} from "@/app/actions/platform.actions";
import { calculateSaaSPrice, formatInr } from "@/lib/saas-pricing";

export default function PlatformPlansPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = React.useState<SaasPlanDto[]>([]);
  const [coupons, setCoupons] = React.useState<
    Array<{ id: string; code: string; discount_type: string; discount_value: number; is_active: boolean }>
  >([]);

  // Calculator preview state
  const [calcPlanId, setCalcPlanId] = React.useState("");
  const [calcStudents, setCalcStudents] = React.useState(450);
  const [calcCycle, setCalcCycle] = React.useState<"monthly" | "yearly">("yearly");

  // New coupon state
  const [couponCode, setCouponCode] = React.useState("");
  const [discountType, setDiscountType] = React.useState<"percent" | "amount">("percent");
  const [discountValue, setDiscountValue] = React.useState(15);

  const load = React.useCallback(async () => {
    const res = await listPlansAndCouponsAction();
    if (!res.ok) {
      showToast(res.error, "warning");
      return;
    }
    setPlans(res.data.plans);
    setCoupons(res.data.coupons);
    if (!calcPlanId && res.data.plans[0]) setCalcPlanId(res.data.plans[0].id);
  }, [calcPlanId, showToast]);

  React.useEffect(() => {
    let active = true;
    void listPlansAndCouponsAction().then((res) => {
      if (!active) return;
      if (!res.ok) {
        showToast(res.error, "warning");
        return;
      }
      setPlans(res.data.plans);
      setCoupons(res.data.coupons);
      if (res.data.plans[0]) setCalcPlanId((prev) => prev || res.data.plans[0].id);
    });
    return () => {
      active = false;
    };
  }, [showToast]);

  const activePlan = plans.find((p) => p.id === calcPlanId) ?? plans[0] ?? null;
  const calcResult = activePlan
    ? calculateSaaSPrice({
        slabs: activePlan.slabs,
        studentCount: calcStudents,
        billingCycle: calcCycle,
        yearlyDiscountPct: activePlan.yearlyDiscountPct,
        setupFeeInr: activePlan.setupFeeInr,
        includeSetupFee: true,
        gstPct: activePlan.gstPct,
      })
    : null;

  return (
    <AppShell
      role="super_admin"
      title="Plans, INR Student Slabs & Coupons"
      subtitle="Config-driven per-student pricing slabs, GST %, resource limits & promo codes"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {plans.map((p) => (
          <Card key={p.id} className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">{p.name}</h2>
                <span className="text-xs font-mono text-ink-muted">{p.code}</span>
              </div>
              <StatusBadge tone="primary">{p.yearlyDiscountPct}% Yearly Off</StatusBadge>
            </div>
            <p className="text-xs text-ink-secondary">{p.description}</p>
            <div className="border-t border-line pt-2 text-xs flex flex-col gap-1">
              {p.slabs.map((sl, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-ink-secondary">
                    {sl.max ? `${sl.min}–${sl.max} students` : `${sl.min}+ students`}
                  </span>
                  <strong className="text-ink">{formatInr(sl.price_per_student_month)}/student/mo</strong>
                </div>
              ))}
            </div>
            <div className="border-t border-line pt-2 text-[11px] text-ink-secondary">
              Limits: {p.maxStudents} students · {p.maxTeachers} teachers · {p.maxStorageMb} MB · Setup {formatInr(p.setupFeeInr)} · GST {p.gstPct}%
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const updatedDiscount = p.yearlyDiscountPct === 15 ? 20 : 15;
                const r = await upsertSaasPlanAction({
                  id: p.id,
                  code: p.code,
                  name: p.name,
                  description: p.description,
                  yearlyDiscountPct: updatedDiscount,
                  setupFeeInr: p.setupFeeInr,
                  gstPct: p.gstPct,
                  maxStudents: p.maxStudents,
                  maxTeachers: p.maxTeachers,
                  maxStaff: p.maxStaff,
                  maxStorageMb: p.maxStorageMb,
                  enabledModules: p.enabledModules,
                  slabs: p.slabs,
                });
                if (r.ok) {
                  showToast(`Updated ${p.name} yearly discount to ${updatedDiscount}%.`);
                  void load();
                } else showToast(r.error ?? "Save failed.", "warning");
              }}
            >
              Toggle 15%/20% Yearly Discount
            </Button>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 flex flex-col gap-4">
          <h2 className="text-base font-bold text-ink">Interactive INR Quote Calculator</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Plan"
              value={calcPlanId}
              onChange={(e) => setCalcPlanId(e.target.value)}
              options={plans.map((p) => ({ label: p.name, value: p.id }))}
            />
            <Input
              label="Students"
              type="number"
              min={10}
              value={String(calcStudents)}
              onChange={(e) => setCalcStudents(Number(e.target.value) || 50)}
            />
            <Select
              label="Cycle"
              value={calcCycle}
              onChange={(e) => setCalcCycle(e.target.value as "monthly" | "yearly")}
              options={[
                { label: "Yearly", value: "yearly" },
                { label: "Monthly", value: "monthly" },
              ]}
            />
          </div>
          {calcResult ? (
            <div className="p-4 rounded-md bg-subtle text-xs grid grid-cols-2 gap-2">
              <span>Slab Price:</span>
              <strong className="text-right">{formatInr(calcResult.perStudentMonthlyInr)}/student/mo</strong>
              <span>Subscription + Setup:</span>
              <strong className="text-right">{formatInr(calcResult.subtotalBeforeCouponInr)}</strong>
              <span>GST ({calcResult.gstPct}%):</span>
              <strong className="text-right">{formatInr(calcResult.gstAmountInr)}</strong>
              <span className="font-bold text-ink">Total Payable:</span>
              <strong className="text-right text-brand text-sm">{formatInr(calcResult.totalPayableInr)}</strong>
            </div>
          ) : null}
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <h2 className="text-base font-bold text-ink">Promo Coupons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
            <Input
              label="Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="LAUNCH20"
            />
            <Select
              label="Type"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percent" | "amount")}
              options={[
                { label: "% Off", value: "percent" },
                { label: "INR Flat", value: "amount" },
              ]}
            />
            <Input
              label="Value"
              type="number"
              value={String(discountValue)}
              onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
            />
            <Button
              onClick={async () => {
                if (!couponCode.trim()) return;
                const r = await upsertCouponAction({ code: couponCode, discountType, discountValue });
                if (r.ok) {
                  showToast(`Saved coupon ${couponCode}.`);
                  setCouponCode("");
                  void load();
                } else showToast(r.error ?? "Failed.", "warning");
              }}
            >
              Add Coupon
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {coupons.map((c) => (
              <StatusBadge key={c.id} tone={c.is_active ? "success" : "neutral"}>
                {c.code}: {c.discount_type === "percent" ? `${c.discount_value}%` : formatInr(c.discount_value)}
              </StatusBadge>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
