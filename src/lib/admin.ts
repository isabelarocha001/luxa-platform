import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Admin access:
 * 1. luxa_profiles.role === 'admin'
 * 2. OR email in ADMIN_EMAILS
 */
export async function requireAdmin() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        ok: false as const,
        status: 401 as const,
        error: "Not logged in",
        user: null,
      };
    }

    const { data: profile } = await supabase
      .from("luxa_profiles")
      .select("id, email, role, display_name")
      .eq("id", user.id)
      .maybeSingle();

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const email = (user.email || profile?.email || "").toLowerCase();
    const isAdmin =
      profile?.role === "admin" ||
      (email !== "" && adminEmails.includes(email));

    if (!isAdmin) {
      return {
        ok: false as const,
        status: 403 as const,
        error: "Admin only",
        user,
      };
    }

    return {
      ok: true as const,
      status: 200 as const,
      user,
      profile:
        profile || {
          id: user.id,
          email: user.email,
          role: "admin",
          display_name: null,
        },
    };
  } catch (e) {
    return {
      ok: false as const,
      status: 500 as const,
      error: e instanceof Error ? e.message : "Admin check failed",
      user: null,
    };
  }
}

export async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && serviceKey) {
    return createServiceClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  if (!url || !anon) {
    throw new Error("Missing Supabase env for admin client");
  }

  return createClient();
}

export function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServiceClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
