"use client";

import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Avatar,
  Button,
  Card,
  Input,
  Select,
  StatusBadge,
} from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlays";
import { DEMO_USERS } from "@/lib/auth";
import { AuthService } from "@/services/auth.service";

const LANGUAGES = [
  { label: "English (India)", value: "en-IN" },
  { label: "English (US)", value: "en-US" },
  { label: "Hindi", value: "hi-IN" },
];

export default function AccountSettingsPage() {
  const { showToast } = useToast();
  const user = React.useSyncExternalStore(
    AuthService.subscribe,
    AuthService.getCurrentClientUser,
    () => DEMO_USERS.admin,
  );
  const [fullNameOverride, setFullNameOverride] = React.useState<string | null>(null);
  const fullName = fullNameOverride ?? user.name;
  const email = user.email;
  const [phone, setPhone] = React.useState("+91 98250 44120");
  const [language, setLanguage] = React.useState<"en-IN" | "en-US" | "hi-IN">("en-IN");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [sessionsOpen, setSessionsOpen] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      const res = await AuthService.updateAccount({
        fullName,
        phone,
        preferredLanguage: language,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      if (!res.ok) {
        showToast(res.error ?? "Unable to update account settings.", "warning");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      await AuthService.refreshClientUser();
      showToast("Personal & security settings saved.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AppShell
      role="common"
      title="My Profile & Account Settings"
      subtitle="Manage profile details, preferred language, password, and active login sessions"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <Card className="lg:col-span-4 p-6 flex flex-col items-center text-center gap-3">
          <Avatar initials={user.initials} size="lg" />
          <div className="pt-1">
            <h2 className="text-lg font-bold text-ink">{fullName}</h2>
            <p className="text-xs text-ink-secondary pt-0.5">
              {user.subtitle} • ID: {user.id}
            </p>
          </div>
          <StatusBadge tone="success">2FA Enabled</StatusBadge>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => showToast("Profile photo stored in private avatars bucket.")}
          >
            Change Profile Photo
          </Button>
        </Card>

        <Card className="lg:col-span-8 p-6">
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <h2 className="text-lg font-bold text-ink border-b border-line pb-3">
              Personal &amp; Security Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullNameOverride(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                readOnly
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Select
                label="Preferred Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en-IN" | "en-US" | "hi-IN")}
                options={LANGUAGES}
              />
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password to change"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Leave blank to keep current"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setSessionsOpen(true)}>
                Manage Active Sessions
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Modal
        open={sessionsOpen}
        onClose={() => setSessionsOpen(false)}
        title="Active Browser & Mobile Sessions"
      >
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-line p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-ink">Chrome on Windows 11</div>
              <div className="text-xs text-ink-secondary">Pune, IN • Current Session</div>
            </div>
            <StatusBadge tone="success">Active</StatusBadge>
          </div>
          <div className="rounded-md border border-line p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-ink">EduCore iOS App</div>
              <div className="text-xs text-ink-secondary">Last active yesterday</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await AuthService.signOut();
                showToast("Session signed out.");
                setSessionsOpen(false);
              }}
            >
              Revoke
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
