import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, key };
}

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();

  if (!url || !key) return null;

  if (!client) {
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export function useSupabase(): boolean {
  const { url, key } = getSupabaseConfig();
  return !!(url && key);
}
