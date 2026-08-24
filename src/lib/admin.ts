import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Admin access rules (docs/ADMIN.md):
 * 1. luxa_profiles.role === 'admin'
 * 2. OR email in ADMIN_EMAILS env (comma-separated) — bootstrap first admin
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401 as const, error: "Not logged in", user: null };
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
    profile?.role === "admin" || (email !== "" && adminEmails.includes(email));

  if (!isAdmin) {
    return { ok: false as const, status: 403 as const, error: "Admin only", user };
  }

  return {
    ok: true as const,
    status: 200 as const,
    user,
    profile: profile || { id: user.id, email: user.email, role: "admin", display_name: null },
  };
}

export function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServiceClient(url, key);
}
