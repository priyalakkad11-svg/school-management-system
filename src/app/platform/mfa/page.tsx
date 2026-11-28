"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button, Card, Input, StatusBadge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { createClient } from "@/lib/supabase/client";

export default function PlatformMfaPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = React.useState<"loading" | "needs_enroll" | "needs_verify" | "verified">("loading");
  const [factorId, setFactorId] = React.useState<string | null>(null);
  const [qrSvg, setQrSvg] = React.useState<string | null>(null);
  const [secret, setSecret] = React.useState<string | null>(null);
  const [code, setCode] = React.useState("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const supabase = createClient();
    void Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]).then(([factorsRes, aalRes]) => {
      if (!active) return;
      const verifiedTotp = factorsRes.data?.totp?.find((f) => f.status === "verified");
      if (aalRes.data?.currentLevel === "aal2" && verifiedTotp) {
        setStatus("verified");
        setFactorId(verifiedTotp.id);
      } else if (verifiedTotp) {
        setFactorId(verifiedTotp.id);
        setStatus("needs_verify");
      } else {
        setStatus("needs_enroll");
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleEnroll = async () => {
    setPending(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "EduCore Super Admin Authenticator",
      });
      if (error || !data) {
        showToast(error?.message ?? "Unable to enroll TOTP factor.", "warning");
        return;
      }
      setFactorId(data.id);
      setQrSvg(data.totp.qr_code);
      setSecret(data.totp.secret);
      setStatus("needs_verify");
      showToast("Scan the QR code in Google Authenticator / 1Password and verify a 6-digit code.");
    } finally {
      setPending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || code.trim().length !== 6) {
      showToast("Enter the 6-digit TOTP code.", "warning");
      return;
    }
    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: code.trim(),
      });
      if (error) {
        showToast(error.message || "Invalid TOTP verification code.", "warning");
        return;
      }
      showToast("Super Admin MFA verified (AAL2 session active).");
      router.push("/platform");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <AppShell
      role="super_admin"
      title="Super Admin TOTP Multi-Factor Security"
      subtitle="Platform owners must complete TOTP MFA before accessing tenant billing & support controls"
    >
      <Card className="p-6 max-w-xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Authenticator Protection</h2>
          <StatusBadge tone={status === "verified" ? "success" : "warning"}>
            {status === "verified" ? "AAL2 Verified" : status === "loading" ? "Checking..." : "Action Required"}
          </StatusBadge>
        </div>

        {status === "needs_enroll" ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink-secondary">
              No verified TOTP authenticator is attached to this Super Admin account yet. Enroll now
              to protect all multi-school platform controls.
            </p>
            <Button onClick={handleEnroll} disabled={pending}>
              {pending ? "Generating QR..." : "Set Up Authenticator App (TOTP)"}
            </Button>
          </div>
        ) : null}

        {status === "needs_verify" ? (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            {qrSvg ? (
              <div className="p-4 rounded-lg border border-line bg-subtle flex flex-col gap-2 items-center">
                <div
                  className="bg-surface p-2 rounded-md"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                {secret ? (
                  <p className="text-xs font-mono text-ink-secondary break-all">
                    Manual Key: {secret}
                  </p>
                ) : null}
              </div>
            ) : null}
            <Input
              label="6-Digit Authenticator Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />
            <Button type="submit" disabled={pending}>
              {pending ? "Verifying..." : "Verify & Continue to Platform"}
            </Button>
          </form>
        ) : null}

        {status === "verified" ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink-secondary">
              TOTP Multi-Factor Authentication is verified for your current session.
            </p>
            <div>
              <Button onClick={() => router.push("/platform")}>Go to Platform Dashboard</Button>
            </div>
          </div>
        ) : null}
      </Card>
    </AppShell>
  );
}
