import { NextResponse } from "next/server";
import { getAdminClient, requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";

const log = logger("api.admin.creators");

/**
 * POST — create luxa_creators row (admin only).
 * Uses service role if set, otherwise admin session + RLS policy.
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
      return NextResponse.json(
        { error: "displayName required" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(priceMonthly) || priceMonthly < 1) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const price_monthly_cents = Math.round(priceMonthly * 100);
    const db = await getAdminClient();

    log.info("create creator", { handle, adminId: auth.user!.id });

    const { data, error } = await db
      .from("luxa_creators")
      .insert({
        user_id: null,
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
      })
      .select("id, handle")
      .single();

    if (error) {
      log.error("create failed", { err: error.message, handle, code: error.code });
      if (error.code === "23505" || error.message.includes("unique")) {
        return NextResponse.json(
          { error: "Handle already taken" },
          { status: 409 },
        );
      }
      if (error.message.includes("row-level security")) {
        return NextResponse.json(
          {
            error:
              "RLS blocked insert. Add SUPABASE_SERVICE_ROLE_KEY on Vercel or ensure luxa_profiles.role=admin for your user.",
          },
          { status: 403 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    log.info("creator created", { id: data.id, handle: data.handle });
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed";
    log.error("exception", { err: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
