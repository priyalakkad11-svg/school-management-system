"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, Input, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [password, setPassword] = React.useState("Educore@2026");
  const [confirm, setConfirm] = React.useState("Educore@2026");
  const [error, setError] = React.useState<string | null>(null);

  const hasMinLen = password.length >= 8;
  const hasUpperNum = /[A-Z]/.test(password) && /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMinLen || !hasUpperNum || !hasSymbol) {
      setError("Password must meet all strength criteria.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    showToast("Password updated. Sign in with your new credentials.");
    router.push("/login");
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="self-start">
          <StatusBadge tone="success">OTP Verified</StatusBadge>
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-bold text-ink">Create New Password</h2>
          <p className="text-sm text-ink-secondary">
            Choose a strong password with at least 8 characters, a number, and a symbol.
          </p>
        </div>

        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          label="Confirm New Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <div className="rounded-md bg-success-soft px-3.5 py-2.5 text-xs font-medium text-success">
          {hasMinLen ? "✓" : "○"} Minimum 8 characters • {hasUpperNum ? "✓" : "○"} Uppercase &amp;
          number • {hasSymbol ? "✓" : "○"} Special symbol
        </div>

        {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Reset Password &amp; Sign In
        </Button>
      </form>
    </AuthLayout>
  );
}

