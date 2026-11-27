"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, Input, Select, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { AuthService } from "@/services/auth.service";

const SECURITY_QUESTIONS = [
  { label: "What was your first school's name?", value: "first_school" },
  { label: "What city were you born in?", value: "birth_city" },
  { label: "What was the name of your childhood pet?", value: "pet" },
];

export default function SetupPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [identifier, setIdentifier] = React.useState("");
  const [tempPassword, setTempPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [question, setQuestion] = React.useState("first_school");
  const [answer, setAnswer] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !identifier.trim() ||
      !tempPassword.trim() ||
      newPassword.length < 8 ||
      newPassword !== confirmPassword ||
      !answer.trim()
    ) {
      setError("Complete all password fields and security recovery details.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await AuthService.setupPassword({
        identifier: identifier.trim(),
        tempPassword,
        newPassword,
        confirmPassword,
        securityQuestion: question,
        securityAnswer: answer,
      });
      if (!res.ok || !res.data) {
        setError(res.error ?? "Unable to activate account.");
        return;
      }
      showToast("Account activated! Signed in to your portal.");
      router.push(res.data.redirectTo);
      router.refresh();
    } finally {
      setPending(false);
    }
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
          label="Email or School ID"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="ADM-2026-0142 or name@greenwood.edu"
        />

        <Input
          label="Current Temporary Password"
          type="password"
          value={tempPassword}
          onChange={(e) => setTempPassword(e.target.value)}
          placeholder="••••••••••••"
        />

        <Input
          label="New Permanent Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Minimum 8 characters"
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
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
          placeholder="Your recovery answer"
        />

        {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}

        <Button type="submit" variant="primary" size="lg" className="w-full mt-1" disabled={pending}>
          {pending ? "Activating Account..." : "Save & Activate Account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
