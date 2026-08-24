import { NextResponse } from "next/server";
import {
  getStripe,
  planAmountCents,
  extractInvoiceClientSecret,
} from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getCreatorByHandle } from "@/lib/creators";
import { logger } from "@/lib/logger";

const log = logger("api.checkout.create-subscription");

/**
 * Incomplete subscription → clientSecret for Payment Element.
 * Creator must exist in luxa_creators (no demo).
 * Docs: docs/STRIPE.md
 */
export async function POST(request: Request) {
  const started = Date.now();
  try {
    const body = await request.json();
    const handle = String(body.handle || "");
    const planMonths = Number(body.planMonths || 1);

    log.info("request", { handle, planMonths });

    const creator = await getCreatorByHandle(handle);
    if (!creator) {
      log.warn("creator not found", { handle });
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    if (![1, 3, 6, 12].includes(planMonths)) {
      log.warn("invalid plan", { planMonths });
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      log.warn("auth required", { handle });
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

    let customerId: string;
    const existing = await stripe.customers.search({
      query: `metadata['luxa_user_id']:'${user.id}'`,
      limit: 1,
    });
    if (existing.data[0]) {
      customerId = existing.data[0].id;
      log.info("customer reused", { userId: user.id, customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { luxa_user_id: user.id },
      });
      customerId = customer.id;
      log.info("customer created", { userId: user.id, customerId });
    }

    const product = await stripe.products.create({
      name: `@${creator.handle} — ${planMonths}mo`,
      metadata: {
        creator_handle: creator.handle,
        plan_months: String(planMonths),
        luxa: "1",
      },
    });
    log.info("product created", { productId: product.id, handle, planMonths });

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
            product: product.id,
            unit_amount: amountCents,
            recurring: {
              interval: "month",
              interval_count: planMonths,
            },
          },
        },
      ],
      metadata: {
        fan_user_id: user.id,
        creator_handle: creator.handle,
        plan_months: String(planMonths),
      },
      expand: ["latest_invoice.confirmation_secret"],
    });

    const clientSecret = extractInvoiceClientSecret(subscription.latest_invoice);

    if (!clientSecret) {
      log.error("missing client secret", {
        subscriptionId: subscription.id,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Could not get payment client secret" },
        { status: 500 },
      );
    }

    log.info("subscription ready", {
      userId: user.id,
      subscriptionId: subscription.id,
      customerId,
      amountCents,
      ms: Date.now() - started,
    });

    return NextResponse.json({
      clientSecret,
      subscriptionId: subscription.id,
      customerId,
      amountCents,
      currency: "eur",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Subscription failed";
    log.error("failed", { err: message, ms: Date.now() - started });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
