"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, Checkbox, Input } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { DEMO_USERS } from "@/lib/auth";
import { AuthService } from "@/services/auth.service";
import type { UserRole } from "@/types/domain";
import { cn } from "@/lib/utils";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
  { value: "staff", label: "Staff" },
];

const ROLE_BUTTON_LABEL: Record<UserRole, string> = {
  admin: "Sign In to Admin Portal",
  teacher: "Sign In to Teacher Portal",
  student: "Sign In to Student Portal",
  parent: "Sign In to Parent Portal",
  staff: "Sign In to Staff Portal",
};

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = React.useState<UserRole>("admin");
  const [identifier, setIdentifier] = React.useState(DEMO_USERS.admin.email);
  const [password, setPassword] = React.useState("Educore@2026");
  const [remember, setRemember] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setIdentifier(DEMO_USERS[role].email);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || password.length < 6) {
      setError("Please enter a valid portal email / ID and password (min 6 characters).");
      return;
    }
    const res = AuthService.signIn(selectedRole);
    showToast(`Signed in as ${res.user.name} (${res.user.subtitle})`);
    router.push(res.redirectTo);
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-bold text-ink">Sign in to EduCore</h2>
          <p className="text-sm text-ink-secondary">
            Select your portal role and enter your credentials
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-ink">Select Role</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Portal Role">
            {ROLES.map((role) => {
              const active = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleRoleChange(role.value)}
                  className={cn(
                    "min-h-10 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer",
                    active
                      ? "bg-brand text-ink-on-dark"
                      : "bg-subtle text-ink-secondary hover:text-ink",
                  )}
                >
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Email or Admission / Employee ID"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="admin@greenwood.edu"
          autoComplete="username"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          autoComplete="current-password"
        />

        {error ? (
          <p className="text-xs font-medium text-danger bg-danger-soft px-3 py-2 rounded-md">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Checkbox label="Remember this device" checked={remember} onChange={setRemember} />
          <Link href="/forgot-password" className="text-xs font-semibold text-brand hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full">
          {ROLE_BUTTON_LABEL[selectedRole]}
        </Button>

        <div className="pt-2 border-t border-line flex items-center justify-between text-xs text-ink-secondary">
          <span>First-time school invite?</span>
          <Link href="/setup-password" className="font-semibold text-brand hover:underline">
            Complete Account Setup
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

