"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, Input, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { AuthService } from "@/services/auth.service";
import { cn } from "@/lib/utils";

function OtpVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [email, setEmail] = React.useState(() => searchParams.get("email") ?? "");
  const [digits, setDigits] = React.useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = React.useState(42);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const handleDigitChange = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = clean;
    setDigits(next);
    setError(null);
    if (clean && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your registered email address.");
      return;
    }
    if (digits.some((d) => d === "")) {
      setError("Please enter all 6 verification digits.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await AuthService.verifyOtp({ email: email.trim(), otp: digits.join("") });
      if (!res.ok) {
        setError(res.error ?? "Invalid or expired OTP.");
        return;
      }
      showToast("OTP verified successfully.");
      router.push("/reset-password");
    } finally {
      setPending(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Enter your email address before resending OTP.");
      return;
    }
    const res = await AuthService.sendRecoveryOtp({ role: "teacher", contact: email.trim() });
    if (!res.ok) {
      setError(res.error ?? "Unable to resend OTP.");
      return;
    }
    setSeconds(42);
    showToast("New OTP dispatched.");
  };

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-5" noValidate>
      <div className="self-start">
        <StatusBadge tone="primary">2-Step Verification</StatusBadge>
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold text-ink">Enter 6-Digit OTP</h2>
        <p className="text-sm text-ink-secondary leading-relaxed">
          Enter the 6-digit verification code sent to your registered portal email address.
        </p>
      </div>

      <Input
        label="Registered Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@greenwood.edu"
      />

      <div className="grid grid-cols-6 gap-2 sm:gap-3" role="group" aria-label="6-digit OTP">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            aria-label={`OTP digit ${idx + 1}`}
            value={digit}
            placeholder="•"
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={cn(
              "h-12 sm:h-14 w-full text-center text-lg font-bold rounded-md border bg-surface text-ink focus:outline-2 focus:outline-offset-0 focus:outline-line-focus",
              digit ? "border-brand" : "border-line",
            )}
          />
        ))}
      </div>

      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}

      <div className="flex items-center justify-between text-xs text-ink-secondary">
        <span>
          {seconds > 0
            ? `Resend code in 00:${String(seconds).padStart(2, "0")}`
            : "Did not receive the code?"}
        </span>
        {seconds === 0 ? (
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold text-brand hover:underline cursor-pointer"
          >
            Resend OTP
          </button>
        ) : null}
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? "Verifying..." : "Verify & Continue"}
      </Button>
    </form>
  );
}

export default function OtpVerificationPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-sm text-ink-secondary">Loading verification...</div>}>
        <OtpVerificationForm />
      </Suspense>
    </AuthLayout>
  );
}
