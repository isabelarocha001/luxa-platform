import { NextResponse } from "next/server";
import { adminDb, requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";

const log = logger("api.admin.creators");

/**
 * POST — create luxa_creators row (admin only).
 * Docs: docs/ADMIN.md
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const handle = String(body.handle || "")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
    const displayName = String(body.displayName || "").trim();
    const bio = String(body.bio || "").trim() || null;
    const location = String(body.location || "").trim() || null;
    const priceMonthly = Number(body.priceMonthly);
    const avatarUrl = body.avatarUrl ? String(body.avatarUrl) : null;
    const bannerUrl = body.bannerUrl ? String(body.bannerUrl) : null;

    if (handle.length < 3 || handle.length > 30) {
      return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
    }
    if (!displayName) {
      return NextResponse.json({ error: "displayName required" }, { status: 400 });
    }
    if (!Number.isFinite(priceMonthly) || priceMonthly < 1) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const price_monthly_cents = Math.round(priceMonthly * 100);
    const db = adminDb();

    // Optional: link to admin user if creating “own” creator — use null user_id needs schema change
    // Schema requires user_id NOT NULL — create a placeholder by using admin's id only if unique
    // Better: allow creators without fan account via synthetic — schema has user_id unique NOT NULL
    // Fix: use admin user id only for first; for multiple creators we need nullable user_id
    // → insert with auth.user.id and if conflict, still allow by checking — actually unique user_id means one creator per user.
    // For platform admin creating many creators, user_id should be optional. Try insert with admin id only once;
    // For subsequent, generate note. We'll set user_id to admin and on unique violation use random uuid in profiles? 
    // Simplest fix for multi creators: alter is not available here easily — use admin user_id for all is wrong.
    // Use service role to insert with user_id = auth.user.id for first creator owned by admin,
    // For more creators without accounts: we need nullable user_id.
    // Checking schema: user_id uuid not null unique.
    // Workaround: create orphan auth users is too heavy.
    // I'll insert with user_id = admin's id and document that one admin account maps one "owner";
    // Actually for demo multi-creators from admin, insert without violating: store creators with user_id pointing to admin only works once.
    // Temporary approach: try insert with admin id; if unique fail, return error "schema requires one creator per user — run migration to make user_id nullable".
    // BETTER: use SQL via management API... user asked for admin panel. I'll make user_id = auth.user.id and allow update if exists, OR
    // Create multiple by using handle-based unique only — need nullable user_id.
    // I'll call insert and if error 23505 on user_id, return clear message.

    const row = {
      user_id: auth.user!.id,
      handle,
      display_name: displayName,
      bio,
      location,
      avatar_url: avatarUrl,
      banner_url: bannerUrl,
      price_monthly_cents,
      currency: "eur",
      is_active: true,
      is_verified: false,
    };

    log.info("create creator", { handle, adminId: auth.user!.id });

    // Prefer insert without tying all to same user: if admin already has a creator, still insert
    // by using a service workaround — duplicate user_id fails. So we check count.
    const { count } = await db
      .from("luxa_creators")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.user!.id);

    if ((count || 0) > 0) {
      // Schema constraint: one creator per user_id. Insert with same user_id will fail.
      // Create creator rows by reusing handle uniqueness with a note — we need nullable user_id.
      // Attempt insert anyway will fail; return actionable error.
      const { data, error } = await db
        .from("luxa_creators")
        .insert({ ...row, user_id: auth.user!.id })
        .select("id, handle")
        .single();

      if (error) {
        log.error("create failed", { err: error.message, handle });
        if (error.message.includes("unique") || error.code === "23505") {
          return NextResponse.json(
            {
              error:
                "Schema allows 1 creator per user_id. Promote another user to creator or make user_id nullable. Handle may also be taken.",
            },
            { status: 409 },
          );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data);
    }

    const { data, error } = await db
      .from("luxa_creators")
      .insert(row)
      .select("id, handle")
      .single();

    if (error) {
      log.error("create failed", { err: error.message, handle });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mark profile as creator role if fan
    await db
      .from("luxa_profiles")
      .update({ role: "admin" })
      .eq("id", auth.user!.id);

    log.info("creator created", { id: data.id, handle: data.handle });
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed";
    log.error("exception", { err: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
