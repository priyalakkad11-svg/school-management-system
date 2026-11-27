import "server-only";
import { createClient } from "@supabase/supabase-js";
import { envServer } from "@/lib/env.server";
import type { Database } from "@/types/db";

export function createAdminClient() {
  return createClient<Database>(
    envServer.NEXT_PUBLIC_SUPABASE_URL,
    envServer.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
