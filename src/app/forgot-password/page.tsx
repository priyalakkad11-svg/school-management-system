"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { AuthService } from "@/services/auth.service";
import type { UserRole } from "@/types/domain";

const ROLE_OPTIONS = [
  { label: "Teacher / Faculty", value: "teacher" },
  { label: "Admin / Principal", value: "admin" },
  { label: "Student", value: "student" },
  { label: "Parent / Guardian", value: "parent" },
  { label: "Staff", value: "staff" },
];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [role, setRole] = React.useState<UserRole>("teacher");
  const [contact, setContact] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setError("Enter your registered email or school ID");
      return;
    }
    setPending(true);
    setError(undefined);
    try {
      const res = await AuthService.sendRecoveryOtp({ role, contact });
      if (!res.ok || !res.data) {
        setError(res.error ?? "Unable to send verification OTP.");
        return;
      }
      showToast("6-digit verification OTP sent to your email.");
      router.push(`/otp-verification?email=${encodeURIComponent(res.data.email)}`);
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="self-start">
          <StatusBadge tone="info">Account Recovery</StatusBadge>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-bold text-ink">Forgot your password?</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Enter your registered email or school ID and we will send a 6-digit verification OTP.
          </p>
        </div>

        <Select
          label="Portal Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={ROLE_OPTIONS}
        />

        <Input
          label="Registered Email or School ID"
          type="text"
          value={contact}
          error={error}
          onChange={(e) => setContact(e.target.value)}
          placeholder="kavita.nair@greenwood.edu"
        />

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
          {pending ? "Sending OTP..." : "Send Verification OTP"}
        </Button>

        <Link href="/login" className="w-full">
          <Button variant="outline" size="lg" className="w-full">
            Back to Login
          </Button>
        </Link>
      </form>
    </AuthLayout>
  );
}
