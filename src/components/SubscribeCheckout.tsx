"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Lock, ArrowLeft, Loader2 } from "lucide-react";
import type { Creator } from "@/lib/demo-data";

/** Stripe Checkout — card only, EUR subscriptions. */
export function SubscribeCheckout({ creator }: { creator: Creator }) {
  const params = useSearchParams();
  const router = useRouter();
  const planMonths = Number(params.get("plan") || "1");
  const bundle = creator.bundles.find((b) => b.months === planMonths);
  const price = bundle ? bundle.total : creator.priceMonthly * planMonths;
  const label = bundle
    ? `${bundle.months} months (€${bundle.total.toFixed(2)})`
    : planMonths === 1
      ? `1 month (€${creator.priceMonthly.toFixed(2)})`
      : `${planMonths} months (€${price.toFixed(2)})`;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: creator.handle, planMonths }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(
          `/auth/login?next=${encodeURIComponent(`/c/${creator.handle}/subscribe?plan=${planMonths}`)}`,
        );
        return;
      }
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <Link
        href={`/c/${creator.handle}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-luxa-muted hover:text-luxa-text"
      >
        <ArrowLeft size={16} /> Back to profile
      </Link>

      <div className="rounded-2xl border border-luxa-border bg-luxa-card p-6">
        <div className="flex items-center gap-3">
          <img
            src={creator.avatar}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{creator.displayName}</p>
            <p className="text-sm text-luxa-muted">@{creator.handle}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-luxa-surface p-4">
          <p className="text-xs font-semibold uppercase text-luxa-muted">Plan</p>
          <p className="mt-1 text-lg font-bold">{label}</p>
          <p className="mt-1 text-xs text-luxa-muted">
            Recurring · Cancel anytime · EUR · Card only
          </p>
        </div>

        <div className="mt-6">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <CreditCard size={16} className="text-luxa-accent" />
            Pay with card
          </p>
          <p className="mb-4 text-xs text-luxa-muted">
            You will be redirected to Stripe Checkout (Visa, Mastercard, Amex).
            Secure card processing — no PIX or crypto.
          </p>

          {error && (
            <p className="mb-3 text-sm text-red-400">{error}</p>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={startCheckout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-luxa-accent py-3.5 text-sm font-bold text-white hover:bg-luxa-accentHover disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Redirecting…
              </>
            ) : (
              <>
                <Lock size={16} /> Pay €{price.toFixed(2)} with Stripe
              </>
            )}
          </button>
        </div>
        <p className="mt-4 text-center text-[11px] text-luxa-muted">
          18+ · GDPR · EU consumer rights · Powered by Stripe
        </p>
      </div>
    </main>
  );
}
