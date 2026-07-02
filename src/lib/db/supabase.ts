import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client. Safe to use in "use client" components.
// The anon key is intentionally public -- Row Level Security on every
// table ensures users can only ever access their own rows.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
