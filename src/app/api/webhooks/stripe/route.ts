import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const log = logger("api.webhooks.stripe");

/**
 * Stripe webhook → sync luxa_subscriptions.
 * Requires STRIPE_WEBHOOK_SECRET in production.
 * Docs: docs/STRIPE.md | docs/DEVELOPMENT.md
 */
function adminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function POST(request: Request) {
  const started = Date.now();
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      log.warn("webhook without signature verification (missing secret or sig)");
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    log.error("signature failed", { err: msg });
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  log.info("event received", { type: event.type, id: event.id });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        await upsertSubscription(session);
      }
    }

    if (event.type === "customer.subscription.created") {
      const sub = event.data.object as Stripe.Subscription;
      await upsertFromSubscription(sub);
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscriptionStatus(sub);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "handler failed";
    log.error("handler failed", { err: msg, type: event.type });
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  log.info("event handled", { type: event.type, ms: Date.now() - started });
  return NextResponse.json({ received: true });
}

async function upsertSubscription(session: Stripe.Checkout.Session) {
  const fanId = session.metadata?.fan_user_id || session.client_reference_id;
  const handle = session.metadata?.creator_handle;
  const planMonths = Number(session.metadata?.plan_months || 1);
  if (!fanId || !handle) {
    log.warn("session missing metadata", {
      hasFan: !!fanId,
      hasHandle: !!handle,
    });
    return;
  }

  const supabase = adminSupabase();
  const { data: creator } = await supabase
    .from("luxa_creators")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();

  if (!creator?.id) {
    log.warn("no luxa_creators row — Stripe only", { handle, fanId });
    return;
  }

  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + planMonths);

  const { error } = await supabase.from("luxa_subscriptions").upsert(
    {
      fan_id: fanId,
      creator_id: creator.id,
      plan_months: planMonths,
      status: "active",
      stripe_subscription_id: subId,
      stripe_customer_id: customerId,
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "fan_id,creator_id" },
  );

  if (error) {
    log.error("upsert failed", { err: error.message, handle, fanId });
  } else {
    log.info("subscription upserted", { handle, fanId, subId });
  }
}

async function upsertFromSubscription(sub: Stripe.Subscription) {
  const fanId = sub.metadata?.fan_user_id;
  const handle = sub.metadata?.creator_handle;
  const planMonths = Number(sub.metadata?.plan_months || 1);
  if (!fanId || !handle) {
    log.warn("subscription missing metadata", { subId: sub.id });
    return;
  }

  const supabase = adminSupabase();
  const { data: creator } = await supabase
    .from("luxa_creators")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();

  if (!creator?.id) {
    log.warn("no luxa_creators row — Stripe only", { handle, subId: sub.id });
    return;
  }

  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;

  const { error } = await supabase.from("luxa_subscriptions").upsert(
    {
      fan_id: fanId,
      creator_id: creator.id,
      plan_months: planMonths,
      status: sub.status === "active" || sub.status === "trialing" ? "active" : sub.status,
      stripe_subscription_id: sub.id,
      stripe_customer_id:
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
      current_period_start: sub.current_period_start
        ? new Date(sub.current_period_start * 1000).toISOString()
        : new Date().toISOString(),
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "fan_id,creator_id" },
  );

  if (error) log.error("upsert from sub failed", { err: error.message });
  else log.info("subscription upserted from sub event", { subId: sub.id, handle });
}

async function syncSubscriptionStatus(sub: Stripe.Subscription) {
  const statusMap: Record<string, string> = {
    active: "active",
    canceled: "canceled",
    past_due: "past_due",
    unpaid: "past_due",
    incomplete: "past_due",
    incomplete_expired: "expired",
    trialing: "active",
    paused: "canceled",
  };
  const status = statusMap[sub.status] || "expired";
  const supabase = adminSupabase();
  const { error } = await supabase
    .from("luxa_subscriptions")
    .update({
      status,
      updated_at: new Date().toISOString(),
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
    })
    .eq("stripe_subscription_id", sub.id);

  if (error) {
    log.error("status sync failed", { err: error.message, subId: sub.id });
  } else {
    log.info("status synced", { subId: sub.id, status });
  }
}
