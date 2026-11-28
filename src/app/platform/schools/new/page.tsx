"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Checkbox, Input, Select, StatusBadge, Stepper } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import {
  createSchoolAtomicAction,
  listPlansAndCouponsAction,
  type HandoverCredentialsDto,
  type SaasPlanDto,
} from "@/app/actions/platform.actions";
import { calculateSaaSPrice, formatInr } from "@/lib/saas-pricing";

const STEPS = [
  "School Details",
  "Academic Structure",
  "Plan & Billing",
  "School Admin Account",
];

export default function CreateSchoolWizardPage() {
  const { showToast } = useToast();
  const [step, setStep] = React.useState(0);
  const [plans, setPlans] = React.useState<SaasPlanDto[]>([]);
  const [handover, setHandover] = React.useState<HandoverCredentialsDto | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Step 1
  const [name, setName] = React.useState("");
  const [schoolCode, setSchoolCode] = React.useState("");
  const [board, setBoard] = React.useState("CBSE");
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [accentColor, setAccentColor] = React.useState("indigo");

  // Step 2
  const [academicYearName, setAcademicYearName] = React.useState("2026-27");
  const [gradePreset, setGradePreset] = React.useState<"nursery-12" | "1-12" | "1-10" | "custom">("nursery-12");
  const [customGrades, setCustomGrades] = React.useState("");
  const [sectionsCsv, setSectionsCsv] = React.useState("A, B");

  // Step 3
  const [planId, setPlanId] = React.useState("");
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">("yearly");
  const [studentCountTier, setStudentCountTier] = React.useState(250);
  const [startAsTrial, setStartAsTrial] = React.useState(false);
  const [includeSetupFee, setIncludeSetupFee] = React.useState(true);
  const [couponCode, setCouponCode] = React.useState("");

  // Step 4
  const [adminName, setAdminName] = React.useState("");
  const [adminEmail, setAdminEmail] = React.useState("");
  const [adminPhone, setAdminPhone] = React.useState("");

  React.useEffect(() => {
    void listPlansAndCouponsAction().then((res) => {
      if (res.ok && res.data && res.data.plans.length > 0) {
        setPlans(res.data.plans);
        setPlanId(res.data.plans[1]?.id ?? res.data.plans[0].id);
      }
    });
  }, []);

  const selectedPlan = plans.find((p) => p.id === planId) ?? plans[0] ?? null;
  const priceCalc = selectedPlan
    ? calculateSaaSPrice({
        slabs: selectedPlan.slabs,
        studentCount: studentCountTier,
        billingCycle,
        yearlyDiscountPct: selectedPlan.yearlyDiscountPct,
        setupFeeInr: selectedPlan.setupFeeInr,
        includeSetupFee: includeSetupFee && !startAsTrial,
        gstPct: selectedPlan.gstPct,
      })
    : null;

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planId) {
      showToast("Select a SaaS plan before provisioning.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createSchoolAtomicAction({
        schoolCode: schoolCode.trim() || undefined,
        name,
        board,
        address,
        contactEmail,
        contactPhone,
        accentColor,
        academicYearName,
        gradePreset,
        customGrades: gradePreset === "custom" ? customGrades : undefined,
        sectionsCsv,
        planId,
        billingCycle,
        studentCountTier,
        startAsTrial,
        includeSetupFee,
        couponCode: couponCode.trim() || undefined,
        adminName,
        adminEmail,
        adminPhone: adminPhone.trim() || undefined,
      });

      if (!res.ok || !res.data) {
        showToast(res.error ?? "Unable to create school.", "warning");
        return;
      }

      setHandover(res.data);
      showToast(`Provisioned ${res.data.schoolName} (${res.data.schoolCode}).`);
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard.`);
  };

  if (handover) {
    const handoverBlock = [
      `EduCore SaaS — School Credential Handover`,
      `School Name: ${handover.schoolName} (${handover.board})`,
      `School Code: ${handover.schoolCode}`,
      `Admin Name: ${handover.adminName}`,
      `Admin Email: ${handover.adminEmail}`,
      `Login ID: ${handover.loginId}`,
      `Temporary Password (shown once): ${handover.tempPassword}`,
      `Login URL: ${typeof window !== "undefined" ? window.location.origin : ""}${handover.loginUrl}`,
      `Public Microsite: ${typeof window !== "undefined" ? window.location.origin : ""}${handover.micrositeUrl}`,
      `Plan: ${handover.planName} (${handover.billingCycle})`,
      handover.invoiceNumber ? `GST Invoice: ${handover.invoiceNumber} (${formatInr(handover.totalPayableInr)})` : `Trial Expires: ${handover.trialEndsAt ?? ""}`,
    ].join("\n");

    return (
      <AppShell
        role="super_admin"
        title="Screen 118 · Credential Handover Sheet"
        subtitle="Printable one-time onboarding credentials — save or hand over now (password is never stored plaintext)"
        actions={
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" onClick={() => void copyText("Full Handover Sheet", handoverBlock)}>
              Copy All Credentials
            </Button>
            <Button onClick={() => window.print()}>Print Handover Sheet</Button>
          </div>
        }
      >
        <Card className="p-6 max-w-3xl flex flex-col gap-5 border-2 border-brand">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="text-xl font-bold text-ink">{handover.schoolName}</h2>
              <p className="text-xs text-ink-secondary">
                {handover.board} · School Code: <strong className="font-mono text-ink">{handover.schoolCode}</strong>
              </p>
            </div>
            <StatusBadge tone="warning">Shown Once · Forced Reset on First Login</StatusBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-md bg-subtle flex flex-col gap-1">
              <span className="text-xs text-ink-secondary">School Code (for ID login)</span>
              <div className="flex items-center justify-between gap-2">
                <strong className="font-mono text-base text-ink">{handover.schoolCode}</strong>
                <Button variant="ghost" size="sm" onClick={() => void copyText("School Code", handover.schoolCode)}>
                  Copy
                </Button>
              </div>
            </div>
            <div className="p-3 rounded-md bg-subtle flex flex-col gap-1">
              <span className="text-xs text-ink-secondary">Admin Login ID</span>
              <div className="flex items-center justify-between gap-2">
                <strong className="font-mono text-base text-ink">{handover.loginId}</strong>
                <Button variant="ghost" size="sm" onClick={() => void copyText("Login ID", handover.loginId)}>
                  Copy
                </Button>
              </div>
            </div>
            <div className="p-3 rounded-md bg-subtle flex flex-col gap-1">
              <span className="text-xs text-ink-secondary">Admin Email</span>
              <strong className="text-ink break-all">{handover.adminEmail}</strong>
            </div>
            <div className="p-3 rounded-md bg-warning-soft flex flex-col gap-1">
              <span className="text-xs font-semibold text-ink">One-Time Temporary Password</span>
              <div className="flex items-center justify-between gap-2">
                <strong className="font-mono text-base text-ink">{handover.tempPassword}</strong>
                <Button variant="ghost" size="sm" onClick={() => void copyText("Password", handover.tempPassword)}>
                  Copy
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-md border border-line text-xs flex flex-col gap-1.5">
            <div>
              <strong>Sign-in Portal:</strong> {handover.loginUrl}
            </div>
            <div>
              <strong>Public School Microsite:</strong> {handover.micrositeUrl}
            </div>
            <div>
              <strong>Plan:</strong> {handover.planName} ({handover.billingCycle}) ·{" "}
              {handover.invoiceNumber
                ? `Invoice ${handover.invoiceNumber} — ${formatInr(handover.totalPayableInr)} incl. GST`
                : "Trial Active"}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 print:hidden">
            <Link href={`/platform/schools/${handover.schoolId}`}>
              <Button>Open School Detail</Button>
            </Link>
            <Link href="/platform/invoices">
              <Button variant="outline">View GST Invoices</Button>
            </Link>
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      role="super_admin"
      title="Create School Wizard"
      subtitle="Atomic multi-tenant school provisioning with academic structure, GST pricing & initial admin handover"
    >
      <Card className="p-5">
        <Stepper steps={STEPS} current={step} />
      </Card>

      <form onSubmit={handleProvision} className="flex flex-col gap-6">
        {step === 0 ? (
          <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="School Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="St. Xavier Public School"
            />
            <Input
              label="School Code (optional auto-generate)"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
              placeholder="e.g. XAV01"
            />
            <Select
              label="Education Board"
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              options={[
                { label: "CBSE", value: "CBSE" },
                { label: "ICSE", value: "ICSE" },
                { label: "State Board", value: "State Board" },
                { label: "IB / Cambridge", value: "IB / Cambridge" },
              ]}
            />
            <Select
              label="Brand Accent"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              options={[
                { label: "Indigo", value: "indigo" },
                { label: "Emerald", value: "emerald" },
                { label: "Royal Blue", value: "blue" },
                { label: "Amber", value: "amber" },
              ]}
            />
            <Input
              label="Official Contact Email"
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="principal@stxaviers.edu.in"
            />
            <Input
              label="Official Contact Phone"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 98200 11223"
            />
            <div className="md:col-span-2">
              <Input
                label="Campus Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="MG Road, Civil Lines, Nagpur 440001"
              />
            </div>
          </Card>
        ) : null}

        {step === 1 ? (
          <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Initial Academic Year"
              value={academicYearName}
              onChange={(e) => setAcademicYearName(e.target.value)}
              placeholder="2026-27"
            />
            <Select
              label="Class Structure Preset"
              value={gradePreset}
              onChange={(e) => setGradePreset(e.target.value as typeof gradePreset)}
              options={[
                { label: "Nursery, LKG, UKG + Grades 1–12", value: "nursery-12" },
                { label: "Grades 1–12", value: "1-12" },
                { label: "Grades 1–10", value: "1-10" },
                { label: "Custom Grade List", value: "custom" },
              ]}
            />
            <Input
              label="Default Sections (comma separated)"
              value={sectionsCsv}
              onChange={(e) => setSectionsCsv(e.target.value)}
              placeholder="A, B, C"
            />
            {gradePreset === "custom" ? (
              <Input
                label="Custom Grade Names (comma separated)"
                value={customGrades}
                onChange={(e) => setCustomGrades(e.target.value)}
                placeholder="Playgroup, Nursery, Grade 1, Grade 2"
              />
            ) : null}
          </Card>
        ) : null}

        {step === 2 ? (
          <Card className="p-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="SaaS Plan"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                options={plans.map((p) => ({ label: p.name, value: p.id }))}
              />
              <Select
                label="Billing Cycle"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as "monthly" | "yearly")}
                options={[
                  { label: "Yearly (with plan discount)", value: "yearly" },
                  { label: "Monthly", value: "monthly" },
                ]}
              />
              <Input
                label="Committed Student Count"
                type="number"
                min={10}
                value={String(studentCountTier)}
                onChange={(e) => setStudentCountTier(Number(e.target.value) || 100)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Input
                label="Promo Coupon Code (optional)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="LAUNCH20"
              />
              <Checkbox
                label="Start with free Trial"
                checked={startAsTrial}
                onChange={setStartAsTrial}
              />
              <Checkbox
                label="Include one-time Setup Fee"
                checked={includeSetupFee}
                onChange={setIncludeSetupFee}
              />
            </div>

            {priceCalc ? (
              <div className="p-4 rounded-lg bg-subtle border border-line grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-ink-secondary block">Slab Rate / Student</span>
                  <strong className="text-sm text-ink">{formatInr(priceCalc.perStudentMonthlyInr)}/mo</strong>
                </div>
                <div>
                  <span className="text-ink-secondary block">Subscription + Setup</span>
                  <strong className="text-sm text-ink">{formatInr(priceCalc.subtotalBeforeCouponInr)}</strong>
                </div>
                <div>
                  <span className="text-ink-secondary block">GST ({priceCalc.gstPct}%)</span>
                  <strong className="text-sm text-ink">{formatInr(priceCalc.gstAmountInr)}</strong>
                </div>
                <div>
                  <span className="text-ink-secondary block">Total Invoice Payable</span>
                  <strong className="text-base text-brand">
                    {startAsTrial ? "₹0 (Trial)" : formatInr(priceCalc.totalPayableInr)}
                  </strong>
                </div>
              </div>
            ) : null}
          </Card>
        ) : null}

        {step === 3 ? (
          <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First School Admin Name"
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Dr. Kavita Deshmukh"
            />
            <Input
              label="School Admin Login Email"
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@stxaviers.edu.in"
            />
            <Input
              label="Admin Mobile Number (optional)"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="+91 98200 11223"
            />
            <div className="p-3 rounded-md bg-info-soft text-info text-xs flex items-center">
              A temporary password & unique School Admin Login ID will be generated once on the next
              printable Handover sheet and required to be changed on first sign-in.
            </div>
          </Card>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0 || submitting}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Previous Step
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            >
              Next Step
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? "Provisioning School..." : "Provision School & Generate Handover"}
            </Button>
          )}
        </div>
      </form>
    </AppShell>
  );
}
