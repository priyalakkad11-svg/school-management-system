"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

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
  const [role, setRole] = React.useState("teacher");
  const [contact, setContact] = React.useState("priya.sharma@greenwood.edu");
  const [error, setError] = React.useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) {
      setError("Enter your registered email or mobile number");
      return;
    }
    setError(undefined);
    showToast("6-digit verification OTP sent.");
    router.push("/otp-verification");
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
            Enter your registered email or mobile number and we will send a 6-digit verification
            OTP.
          </p>
        </div>

        <Select
          label="Portal Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={ROLE_OPTIONS}
        />

        <Input
          label="Registered Email or Phone"
          type="text"
          value={contact}
          error={error}
          onChange={(e) => setContact(e.target.value)}
          placeholder="priya.sharma@greenwood.edu"
        />

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Send Verification OTP
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

