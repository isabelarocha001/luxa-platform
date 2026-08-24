import Stripe from "stripe";

/**
 * Stripe helpers for Luxa.
 *
 * ## Permanent rules (avoid build / API breakage)
 *
 * 1. **Checkout Session** `line_items[].price_data` → may use `product_data: { name }`
 * 2. **Subscription** `items[].price_data` → MUST use `product: "prod_xxx"`
 *    (create Product first). TypeScript `PriceData` has NO `product_data`.
 * 3. Prefer `latest_invoice.confirmation_secret.client_secret` for Payment Element
 *    (modern API). Fallback to expanded payment_intent if present.
 * 4. Card-only EU: `payment_method_types: ["card"]`, currency `eur`.
 * 5. Never send users to hosted Checkout when the product requirement is
 *    inline popup — use Payment Element + incomplete subscription.
 * 6. `apiVersion` must match the installed `stripe` package types or TypeScript build fails.
 *    On package upgrade, bump to the version required by the error message.
 */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  });
}

export function planAmountCents(
  priceMonthly: number,
  planMonths: number,
  bundleTotal?: number,
): number {
  if (bundleTotal != null && planMonths > 1) {
    return Math.round(bundleTotal * 100);
  }
  return Math.round(priceMonthly * planMonths * 100);
}

/** Read client_secret from subscription.latest_invoice (expanded). */
export function extractInvoiceClientSecret(
  latestInvoice: Stripe.Invoice | string | null | undefined,
): string | null {
  if (!latestInvoice || typeof latestInvoice === "string") return null;

  const inv = latestInvoice as Stripe.Invoice & {
    confirmation_secret?: { client_secret?: string | null } | null;
    payment_intent?: string | Stripe.PaymentIntent | null;
  };

  if (inv.confirmation_secret?.client_secret) {
    return inv.confirmation_secret.client_secret;
  }

  if (inv.payment_intent && typeof inv.payment_intent === "object") {
    return inv.payment_intent.client_secret ?? null;
  }

  return null;
}
