import { NextResponse } from "next/server";
import { adminDb, requireAdmin } from "@/lib/admin";
import { logger } from "@/lib/logger";

const log = logger("api.admin.creators.patch");

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const body = await request.json();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.is_active === "boolean") patch.is_active = body.is_active;
  if (typeof body.is_verified === "boolean") patch.is_verified = body.is_verified;
  if (typeof body.display_name === "string") patch.display_name = body.display_name;
  if (typeof body.bio === "string") patch.bio = body.bio;
  if (typeof body.price_monthly_cents === "number")
    patch.price_monthly_cents = body.price_monthly_cents;

  const db = adminDb();
  const { error } = await db.from("luxa_creators").update(patch).eq("id", id);

  if (error) {
    log.error("patch failed", { id, err: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  log.info("patched", { id, patch: Object.keys(patch) });
  return NextResponse.json({ ok: true });
}
