import { NextResponse } from "next/server";

/** Diagnostic — no secrets. Open https://luxa-platform.vercel.app/api/health */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  let supabaseReachable = false;
  let supabaseStatus: number | null = null;
  let supabaseError: string | null = null;

  if (url && anon) {
    try {
      const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, {
        headers: {
          apikey: anon,
          Authorization: `Bearer ${anon}`,
        },
        cache: "no-store",
      });
      supabaseStatus = res.status;
      supabaseReachable = res.ok || res.status === 200 || res.status === 404;
    } catch (e) {
      supabaseError = e instanceof Error ? e.message : "fetch failed";
    }
  }

  return NextResponse.json({
    ok: true,
    app: "luxa",
    time: new Date().toISOString(),
    env: {
      hasSupabaseUrl: Boolean(url),
      supabaseHost: url ? (() => {
        try {
          return new URL(url).host;
        } catch {
          return "INVALID_URL";
        }
      })() : null,
      hasAnonKey: Boolean(anon),
      anonKeyLength: anon.length,
      hasServiceRole: Boolean(service),
      hasAdminEmails: Boolean(process.env.ADMIN_EMAILS),
      hasStripeSecret: Boolean(process.env.STRIPE_SECRET_KEY),
      hasStripePublishable: Boolean(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      ),
    },
    supabase: {
      reachable: supabaseReachable,
      status: supabaseStatus,
      error: supabaseError,
    },
  });
}
