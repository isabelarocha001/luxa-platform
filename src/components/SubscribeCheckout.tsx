"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, Lock, ArrowLeft, Loader2 } from "lucide-react";
import type { Creator } from "@/lib/demo-data";
import { StripePaymentModal } from "@/components/StripePaymentModal";

/** Inline Stripe Payment Element in a popup — no hosted Checkout redirect. */
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
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  async function openInlineCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-subscription", {
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
      if (!res.ok || !data.clientSecret) {
        setError(data.error || "Could not start payment");
        setLoading(false);
        return;
      }
      setClientSecret(data.clientSecret);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/c/${creator.handle}/subscribe/success`
      : `/c/${creator.handle}/subscribe/success`;

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
            Recurring · EUR · Card only · paid inside Luxa
          </p>
        </div>

        <div className="mt-6">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <CreditCard size={16} className="text-luxa-accent" />
            Pay with card
          </p>
          <p className="mb-4 text-xs text-luxa-muted">
            Card form opens in a popup on this page (Stripe Payment Element).
            You are not sent to stripe.com checkout.
          </p>

          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

          <button
            type="button"
            disabled={loading}
            onClick={openInlineCheckout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-luxa-accent py-3.5 text-sm font-bold text-white hover:bg-luxa-accentHover disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Preparing…
              </>
            ) : (
              <>
                <Lock size={16} /> Pay €{price.toFixed(2)}
              </>
            )}
          </button>
        </div>
        <p className="mt-4 text-center text-[11px] text-luxa-muted">
          18+ · GDPR · Secure · Stripe Elements
        </p>
      </div>

      {clientSecret && (
        <StripePaymentModal
          clientSecret={clientSecret}
          amountLabel={`€${price.toFixed(2)}`}
          returnUrl={returnUrl}
          onClose={() => setClientSecret(null)}
          onSuccess={() => {
            setClientSecret(null);
            router.push(`/c/${creator.handle}/subscribe/success`);
          }}
        />
      )}
    </main>
  );
}
