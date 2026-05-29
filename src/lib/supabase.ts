import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

export function isCloudDeploy(): boolean {
  return !!process.env.VERCEL;
}

export function getStorageConfigError(): string {
  const { url, key } = getSupabaseConfig();
  if (url && key) return "";
  const missing: string[] = [];
  if (!url) missing.push("SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL");
  if (!key) missing.push("SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return `Falten variables a Vercel: ${missing.join(", ")}. Settings → Environment Variables → Redeploy.`;
}
