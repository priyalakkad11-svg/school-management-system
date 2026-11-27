import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { envPublic } from "@/lib/env.public";
import type { Database } from "@/types/db";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    envPublic.NEXT_PUBLIC_SUPABASE_URL,
    envPublic.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignored inside Server Components; src/proxy.ts refreshes cookies.
          }
        },
      },
    },
  );
}
