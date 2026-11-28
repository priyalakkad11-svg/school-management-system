import { createAdminClient } from "@/lib/supabase/admin";

export interface RateLimitCheckResult {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil: string | null;
}

export async function checkAndConsumeRateLimit(params: {
  bucketKey: string;
  maxAttempts: number;
  windowMinutes: number;
  lockMinutes: number;
}): Promise<RateLimitCheckResult> {
  const admin = createAdminClient();
  const now = new Date();

  const { data: existing } = await admin
    .from("auth_rate_limits")
    .select("*")
    .eq("bucket_key", params.bucketKey)
    .maybeSingle();

  if (existing?.locked_until && new Date(existing.locked_until) > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: existing.locked_until,
    };
  }

  const windowStartCutoff = new Date(now.getTime() - params.windowMinutes * 60_000);
  const withinWindow = existing && new Date(existing.first_attempt_at) > windowStartCutoff;
  const nextAttempts = withinWindow ? existing.attempts + 1 : 1;
  const shouldLock = nextAttempts > params.maxAttempts;
  const lockedUntil = shouldLock
    ? new Date(now.getTime() + params.lockMinutes * 60_000).toISOString()
    : null;

  await admin.from("auth_rate_limits").upsert(
    {
      bucket_key: params.bucketKey,
      attempts: nextAttempts,
      first_attempt_at: withinWindow ? existing.first_attempt_at : now.toISOString(),
      locked_until: lockedUntil,
      updated_at: now.toISOString(),
    },
    { onConflict: "bucket_key" },
  );

  return {
    allowed: !shouldLock,
    remainingAttempts: Math.max(0, params.maxAttempts - nextAttempts),
    lockedUntil,
  };
}

export async function resetRateLimitBucket(bucketKey: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("auth_rate_limits")
    .upsert(
      {
        bucket_key: bucketKey,
        attempts: 0,
        first_attempt_at: new Date().toISOString(),
        locked_until: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "bucket_key" },
    );
}
