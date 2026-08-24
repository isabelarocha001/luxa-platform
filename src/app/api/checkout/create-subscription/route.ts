import { NextResponse } from "next/server";
import { getStripe, planAmountCents } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getCreatorByHandle } from "@/lib/demo-data";
import type Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const handle = String(body.handle || "");
    const planMonths = Number(body.planMonths || 1);

    const creator = getCreatorByHandle(handle);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    if (![1, 3, 6, 12].includes(planMonths)) {
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

    const stripe = getStripe();

    // Reuse customer by metadata user id
    let customerId: string | undefined;
    const existing = await stripe.customers.search({
      query: `metadata['luxa_user_id']:'${user.id}'`,
      limit: 1,
    });
    if (existing.data[0]) {
      customerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { luxa_user_id: user.id },
      });
      customerId = customer.id;
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            recurring: {
              interval: "month",
              interval_count: planMonths,
            },
            product_data: {
              name: `@${creator.handle} — ${planMonths}mo`,
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
      expand: ["latest_invoice.confirmation_secret", "latest_invoice.payment_intent"],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice | null;
    const clientSecret =
      (invoice as { confirmation_secret?: { client_secret?: string } } | null)
        ?.confirmation_secret?.client_secret ||
      (typeof invoice?.payment_intent === "object" &&
      invoice?.payment_intent &&
      "client_secret" in invoice.payment_intent
        ? (invoice.payment_intent as Stripe.PaymentIntent).client_secret
        : null);

    if (!clientSecret) {
      return NextResponse.json(
        { error: "Could not get payment client secret" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      clientSecret,
      subscriptionId: subscription.id,
      customerId,
      amountCents,
      currency: "eur",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Subscription failed";
    console.error("[create-subscription]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
