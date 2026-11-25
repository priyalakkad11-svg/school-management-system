"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { cn } from "@/lib/utils";

export default function OtpVerificationPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [digits, setDigits] = React.useState(["4", "8", "2", "9", "", ""]);
  const [seconds, setSeconds] = React.useState(42);
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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.some((d) => d === "")) {
      setError("Please enter all 6 verification digits.");
      return;
    }
    showToast("OTP verified successfully.");
    router.push("/reset-password");
  };

  return (
    <AuthLayout>
      <form onSubmit={handleVerify} className="flex flex-col gap-5" noValidate>
        <div className="self-start">
          <StatusBadge tone="primary">2-Step Verification</StatusBadge>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-bold text-ink">Enter 6-Digit OTP</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            We sent a verification code to pr***@greenwood.edu and +91 ••••••4810
          </p>
        </div>

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
              onClick={() => {
                setSeconds(42);
                showToast("New OTP dispatched.");
              }}
              className="font-semibold text-brand hover:underline cursor-pointer"
            >
              Resend OTP
            </button>
          ) : null}
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Verify &amp; Continue
        </Button>
      </form>
    </AuthLayout>
  );
}

