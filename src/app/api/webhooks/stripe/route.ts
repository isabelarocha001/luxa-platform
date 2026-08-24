import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function adminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Dev fallback without signature (do not use in production without secret)
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe webhook]", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        await upsertSubscription(session);
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscriptionStatus(sub);
    }
  } catch (e) {
    console.error("[stripe webhook handler]", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(session: Stripe.Checkout.Session) {
  const fanId = session.metadata?.fan_user_id || session.client_reference_id;
  const handle = session.metadata?.creator_handle;
  const planMonths = Number(session.metadata?.plan_months || 1);
  if (!fanId || !handle) return;

  const supabase = adminSupabase();

  // Resolve creator id from DB if present; otherwise skip DB write (demo handles)
  const { data: creator } = await supabase
    .from("luxa_creators")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();

  if (!creator?.id) {
    console.warn("[stripe] no luxa_creators row for", handle, "— subscription recorded in Stripe only");
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

  await supabase.from("luxa_subscriptions").upsert(
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
  await supabase
    .from("luxa_subscriptions")
    .update({
      status,
      updated_at: new Date().toISOString(),
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
    })
    .eq("stripe_subscription_id", sub.id);
}
