import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Creator, MediaItem } from "@/lib/types";
import { isOnline } from "@/lib/presence";

/**
 * Real creators from Supabase luxa_creators (active only for public).
 * Presence from last_seen_at (heartbeat).
 */

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServiceClient(url, key);
}

const SELECT =
  "id, handle, display_name, bio, location, avatar_url, banner_url, price_monthly_cents, is_verified, is_active, last_seen_at";

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

export async function listActiveCreators(): Promise<Creator[]> {
  const { data, error } = await db()
    .from("luxa_creators")
    .select(SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

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
}

export async function getCreatorByHandle(
  handle: string,
): Promise<Creator | null> {
  const h = handle.toLowerCase();
  const { data, error } = await db()
    .from("luxa_creators")
    .select(SELECT)
    .eq("handle", h)
    .eq("is_active", true)
    .maybeSingle();

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
}
