import { NextResponse } from "next/server";
import { getStripe, planAmountCents } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getCreatorByHandle } from "@/lib/demo-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const handle = String(body.handle || "");
    const planMonths = Number(body.planMonths || 1);

    const creator = getCreatorByHandle(handle);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const allowed = [1, 3, 6, 12];
    if (!allowed.includes(planMonths)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Login required", code: "AUTH_REQUIRED" },
        { status: 401 },
      );
    }

    const bundle = creator.bundles.find((b) => b.months === planMonths);
    const amountCents = planAmountCents(
      creator.priceMonthly,
      planMonths,
      bundle?.total,
    );

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "https://luxa-platform.vercel.app";

    const stripe = getStripe();

    // Card only — no PIX, SEPA, etc. for v1 (EU card focus)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email || undefined,
      client_reference_id: user.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            recurring: {
              interval: "month",
              interval_count: planMonths,
            },
            product_data: {
              name: `@${creator.handle} — ${planMonths} month${planMonths > 1 ? "s" : ""}`,
              description: `Subscription to ${creator.displayName} on Luxa`,
              metadata: {
                creator_handle: creator.handle,
                plan_months: String(planMonths),
              },
            },
          },
        },
      ],
      metadata: {
        fan_user_id: user.id,
        creator_handle: creator.handle,
        plan_months: String(planMonths),
      },
      subscription_data: {
        metadata: {
          fan_user_id: user.id,
          creator_handle: creator.handle,
          plan_months: String(planMonths),
        },
      },
      success_url: `${origin}/c/${creator.handle}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/c/${creator.handle}/subscribe?plan=${planMonths}`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Checkout failed";
    console.error("[checkout]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
