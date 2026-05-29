import { NextResponse } from "next/server";
import { useSupabase, getSupabaseConfig } from "@/lib/supabase";

export async function GET() {
  const { url } = getSupabaseConfig();
  return NextResponse.json({
    ok: true,
    version: "2026-05-29-b",
    supabase: useSupabase(),
    supabaseUrlSet: !!url,
  });
}
