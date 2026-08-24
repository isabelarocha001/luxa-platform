import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, {
    apiVersion: "2025-01-27.acacia",
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
