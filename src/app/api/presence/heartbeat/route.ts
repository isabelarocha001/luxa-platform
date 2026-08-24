import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

const log = logger("api.presence.heartbeat");

/**
 * Creator presence heartbeat.
 * Updates luxa_creators.last_seen_at for the creator linked to the logged-in user (user_id).
 * Call every ~60s while the creator is on the site.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, reason: "anon" }, { status: 200 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const db = createServiceClient(url, key);

    const now = new Date().toISOString();
    const { data, error } = await db
      .from("luxa_creators")
      .update({ last_seen_at: now, updated_at: now })
      .eq("user_id", user.id)
      .eq("is_active", true)
      .select("id, handle")
      .maybeSingle();

    if (error) {
      log.error("update failed", { err: error.message, userId: user.id });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      // Fan account — no creator row linked; fine
      return NextResponse.json({ ok: true, creator: false });
    }

    log.info("heartbeat", { handle: data.handle, userId: user.id });
    return NextResponse.json({ ok: true, creator: true, handle: data.handle });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "failed";
    log.error("exception", { err: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
