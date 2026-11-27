import { createBrowserClient } from "@supabase/ssr";
import { envPublic } from "@/lib/env.public";
import type { Database } from "@/types/db";

export function createClient() {
  return createBrowserClient<Database>(
    envPublic.NEXT_PUBLIC_SUPABASE_URL,
    envPublic.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
