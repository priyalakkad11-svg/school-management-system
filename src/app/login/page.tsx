"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, Checkbox, Input } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { DEMO_USERS } from "@/lib/auth";
import { getSchoolPublicBrandingAction } from "@/app/actions/auth.actions";
import { AuthService } from "@/services/auth.service";
import type { PortalLoginRole } from "@/types/domain";
import { cn } from "@/lib/utils";

const ROLES: { value: PortalLoginRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
  { value: "staff", label: "Staff" },
];

const ROLE_BUTTON_LABEL: Record<PortalLoginRole, string> = {
  admin: "Sign In to Admin Portal",
  teacher: "Sign In to Teacher Portal",
  student: "Sign In to Student Portal",
  parent: "Sign In to Parent Portal",
  staff: "Sign In to Staff Portal",
};

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSchool = searchParams.get("school")?.toUpperCase() ?? "";
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = React.useState<PortalLoginRole>("admin");
  const [schoolCode, setSchoolCode] = React.useState(initialSchool);
  const [showSchoolCodeInput, setShowSchoolCodeInput] = React.useState(Boolean(initialSchool));
  const [schoolBranding, setSchoolBranding] = React.useState<{ name: string; board: string; school_code: string } | null>(null);
  const [identifier, setIdentifier] = React.useState(DEMO_USERS.admin.email);
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!initialSchool) return;
    void getSchoolPublicBrandingAction(initialSchool).then((res) => {
      if (res) setSchoolBranding({ name: res.name, board: res.board, school_code: res.school_code });
    });
  }, [initialSchool]);

  const handleRoleChange = (role: PortalLoginRole) => {
    setSelectedRole(role);
    setIdentifier(schoolCode ? "" : DEMO_USERS[role].email);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || password.length < 6) {
      setError("Please enter a valid portal email / ID and password (min 6 characters).");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await AuthService.signInWithCredentials({
        role: selectedRole,
        schoolCode: schoolCode.trim() || undefined,
        identifier,
        password,
        rememberDevice: remember,
      });
      if (!res.ok || !res.user || !res.redirectTo) {
        setError(res.error ?? "Invalid email/ID or password.");
        return;
      }
      showToast(`Signed in as ${res.user.name} (${res.user.subtitle})`);
      router.push(res.redirectTo);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-bold text-ink">
            {schoolBranding ? schoolBranding.name : "Sign in to EduCore"}
          </h2>
          <p className="text-sm text-ink-secondary">
            {schoolBranding
              ? `${schoolBranding.board} · School Code ${schoolBranding.school_code}`
              : "Select your portal role and enter your credentials"}
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

        {showSchoolCodeInput ? (
          <Input
            label="School Code"
            type="text"
            value={schoolCode}
            onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
            placeholder="e.g. GIA01"
            autoComplete="organization"
          />
        ) : null}

        <Input
          label="Email or Admission / Employee ID"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={schoolCode ? `${schoolCode}-ADM-01` : "admin@greenwood.edu"}
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSchoolCodeInput((prev) => !prev)}
              className="text-xs font-medium text-ink-secondary hover:text-ink cursor-pointer"
            >
              {showSchoolCodeInput ? "Hide School Code" : "Use School Code"}
            </button>
            <Link href="/forgot-password" className="text-xs font-semibold text-brand hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
          {pending ? "Signing in..." : ROLE_BUTTON_LABEL[selectedRole]}
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

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginFormInner />
    </React.Suspense>
  );
}

