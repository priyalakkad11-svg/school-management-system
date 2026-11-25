"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

const SECURITY_QUESTIONS = [
  { label: "What was your first school's name?", value: "first_school" },
  { label: "What city were you born in?", value: "birth_city" },
  { label: "What was the name of your childhood pet?", value: "pet" },
];

export default function SetupPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [tempPassword, setTempPassword] = React.useState("TMP-2026-8841");
  const [newPassword, setNewPassword] = React.useState("Educore@2026");
  const [confirmPassword, setConfirmPassword] = React.useState("Educore@2026");
  const [question, setQuestion] = React.useState("first_school");
  const [answer, setAnswer] = React.useState("St. Xavier Public School");
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPassword.trim() || newPassword.length < 8 || newPassword !== confirmPassword || !answer.trim()) {
      setError("Complete all password fields and security recovery details.");
      return;
    }
    setError(null);
    showToast("Account activated! Please sign in.");
    router.push("/login");
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="self-start">
          <StatusBadge tone="warning">First-Time Login Required</StatusBadge>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-ink">Complete Account Setup</h2>
          <p className="text-sm text-ink-secondary">
            Replace your temporary school-issued password and set security recovery options.
          </p>
        </div>

        <Input
          label="Current Temporary Password"
          type="text"
          value={tempPassword}
          onChange={(e) => setTempPassword(e.target.value)}
        />

        <Input
          label="New Permanent Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Select
          label="Security Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          options={SECURITY_QUESTIONS}
        />

        <Input
          label="Security Answer"
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}

        <Button type="submit" variant="primary" size="lg" className="w-full mt-1">
          Save &amp; Activate Account
        </Button>
      </form>
    </AuthLayout>
  );
}

