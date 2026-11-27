import { z } from "zod";
import { envPublic } from "@/lib/env.public";

if (typeof window !== "undefined") {
  throw new Error("env.server.ts must never be imported in client-side code.");
}

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string({ error: "SUPABASE_SERVICE_ROLE_KEY is required" })
    .min(20, "SUPABASE_SERVICE_ROLE_KEY is missing or invalid"),
});

function validateServerEnv() {
  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid server environment configuration: ${issues}`);
  }

  return {
    ...envPublic,
    ...parsed.data,
  };
}

export const envServer = validateServerEnv();
