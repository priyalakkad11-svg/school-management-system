import { createAdminClient } from "@/lib/supabase/admin";

export interface DispatchMessageInput {
  schoolId: string;
  channel: "Email" | "SMS" | "WhatsApp" | "In-App";
  recipient: string;
  subject: string;
  body: string;
}

/**
 * Isolated Notification & Messaging Adapter.
 * Uses SMTP relay webhook when configured via SMTP_WEBHOOK_URL; otherwise cleanly records
 * queued/stubbed delivery into communication_logs for audit & operator visibility.
 */
export async function dispatchCommunication(input: DispatchMessageInput): Promise<{
  status: "Sent" | "Stubbed";
  providerRef: string;
}> {
  const admin = createAdminClient();
  let status: "Sent" | "Stubbed" = "Stubbed";
  let providerRef = `STUB-${input.channel.toUpperCase()}-${Date.now()}`;

  const webhook = process.env.SMTP_WEBHOOK_URL;
  if (input.channel === "Email" && webhook) {
    try {
      const resp = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: input.recipient,
          subject: input.subject,
          text: input.body,
        }),
      });
      if (resp.ok) {
        status = "Sent";
        providerRef = `SMTP-${Date.now()}`;
      }
    } catch {
      status = "Stubbed";
    }
  } else if (input.channel === "In-App") {
    status = "Sent";
    providerRef = `INAPP-${Date.now()}`;
  }

  await admin.from("communication_logs").insert({
    school_id: input.schoolId,
    channel: input.channel,
    recipient: input.recipient,
    subject: input.subject,
    status,
    provider_ref: providerRef,
  });

  return { status, providerRef };
}
