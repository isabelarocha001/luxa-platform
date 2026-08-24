import { createClient as createServiceClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Creator, MediaItem } from "@/lib/types";
import { isOnline } from "@/lib/presence";

function db(): SupabaseClient | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  if (!url || !key) {
    console.error(
      JSON.stringify({
        level: "error",
        scope: "creators.db",
        message: "Missing Supabase URL or key",
      }),
    );
    return null;
  }

  try {
    // Validate URL early
    // eslint-disable-next-line no-new
    new URL(url);
  } catch {
    console.error(
      JSON.stringify({
        level: "error",
        scope: "creators.db",
        message: "Invalid NEXT_PUBLIC_SUPABASE_URL",
      }),
    );
    return null;
  }

  return createServiceClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapRow(row: Record<string, unknown>): Creator {
  const priceCents = Number(row.price_monthly_cents || 0);
  const priceMonthly = priceCents / 100;
  const handle = String(row.handle || "");
  const displayName = String(row.display_name || handle);
  const lastSeenAt = row.last_seen_at ? String(row.last_seen_at) : null;

  const bundles = [
    {
      months: 3,
      total: Math.round(priceMonthly * 3 * 0.85 * 100) / 100,
      discountPct: 15,
    },
    {
      months: 6,
      total: Math.round(priceMonthly * 6 * 0.8 * 100) / 100,
      discountPct: 20,
    },
    {
      months: 12,
      total: Math.round(priceMonthly * 12 * 0.75 * 100) / 100,
      discountPct: 25,
    },
  ];

  const media: MediaItem[] = [];

  return {
    id: String(row.id || ""),
    handle,
    displayName,
    verified: !!row.is_verified,
    bio: String(row.bio || ""),
    location: String(row.location || ""),
    avatar:
      String(row.avatar_url || "") ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1a1a1e&color=00aeef`,
    banner:
      String(row.banner_url || "") ||
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop",
    priceMonthly,
    bundles,
    stats: { photos: 0, videos: 0, likes: "0" },
    postsCount: 0,
    mediaCount: 0,
    online: isOnline(lastSeenAt),
    lastSeenAt,
    media,
  };
}

const SELECT_FULL =
  "id, handle, display_name, bio, location, avatar_url, banner_url, price_monthly_cents, is_verified, is_active, last_seen_at";
const SELECT_BASIC =
  "id, handle, display_name, bio, location, avatar_url, banner_url, price_monthly_cents, is_verified, is_active";

export async function listActiveCreators(): Promise<Creator[]> {
  try {
    const client = db();
    if (!client) return [];

    let { data, error } = await client
      .from("luxa_creators")
      .select(SELECT_FULL)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // Column last_seen_at may be missing on older DBs — fallback
    if (error && /last_seen_at/i.test(error.message)) {
      const retry = await client
        .from("luxa_creators")
        .select(SELECT_BASIC)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error(
        JSON.stringify({
          level: "error",
          scope: "creators.list",
          message: error.message,
        }),
      );
      return [];
    }
    return (data || []).map((r) => mapRow(r as Record<string, unknown>));
  } catch (e) {
    console.error(
      JSON.stringify({
        level: "error",
        scope: "creators.list",
        message: e instanceof Error ? e.message : "list failed",
      }),
    );
    return [];
  }
}

export async function getCreatorByHandle(
  handle: string,
): Promise<Creator | null> {
  try {
    const h = handle.toLowerCase();
    const client = db();
    if (!client) return null;

    let { data, error } = await client
      .from("luxa_creators")
      .select(SELECT_FULL)
      .eq("handle", h)
      .eq("is_active", true)
      .maybeSingle();

    if (error && /last_seen_at/i.test(error.message)) {
      const retry = await client
        .from("luxa_creators")
        .select(SELECT_BASIC)
        .eq("handle", h)
        .eq("is_active", true)
        .maybeSingle();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error(
        JSON.stringify({
          level: "error",
          scope: "creators.byHandle",
          message: error.message,
          handle: h,
        }),
      );
      return null;
    }
    if (!data) return null;
    return mapRow(data as Record<string, unknown>);
  } catch (e) {
    console.error(
      JSON.stringify({
        level: "error",
        scope: "creators.byHandle",
        message: e instanceof Error ? e.message : "get failed",
      }),
    );
    return null;
  }
}
