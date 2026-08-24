"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CreditCard, Lock, ArrowLeft } from "lucide-react";
import type { Creator } from "@/lib/demo-data";

/** Card-only checkout for EU. Stripe Payment Element goes here. No PIX/crypto in v1. */
export function SubscribeCheckout({ creator }: { creator: Creator }) {
  const params = useSearchParams();
  const planMonths = Number(params.get("plan") || "1");
  const bundle = creator.bundles.find((b) => b.months === planMonths);
  const price = bundle ? bundle.total : creator.priceMonthly;
  const label = bundle
    ? `${bundle.months} months (€${bundle.total.toFixed(2)})`
    : `1 month (€${creator.priceMonthly.toFixed(2)})`;

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <Link href={`/c/${creator.handle}`} className="mb-6 inline-flex items-center gap-1 text-sm text-luxa-muted hover:text-luxa-text">
        <ArrowLeft size={16} /> Back to profile
      </Link>

      <div className="rounded-2xl border border-luxa-border bg-luxa-card p-6">
        <div className="flex items-center gap-3">
          <img src={creator.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="font-semibold">{creator.displayName}</p>
            <p className="text-sm text-luxa-muted">@{creator.handle}</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-luxa-surface p-4">
          <p className="text-xs font-semibold uppercase text-luxa-muted">Plan</p>
          <p className="mt-1 text-lg font-bold">{label}</p>
          <p className="mt-1 text-xs text-luxa-muted">Recurring · Cancel anytime · Prices in EUR</p>
        </div>

        <div className="mt-6">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <CreditCard size={16} className="text-luxa-accent" /> Pay with card
          </p>
          <p className="mb-4 text-xs text-luxa-muted">
            Only card (Visa, Mastercard, Amex). Stripe EU — set keys in .env
          </p>
          <div className="space-y-3">
            <input className="w-full rounded-xl border border-luxa-border bg-luxa-bg px-4 py-3 text-sm outline-none focus:border-luxa-accent" placeholder="Card number" inputMode="numeric" autoComplete="cc-number" />
            <div className="flex gap-3">
              <input className="w-1/2 rounded-xl border border-luxa-border bg-luxa-bg px-4 py-3 text-sm outline-none focus:border-luxa-accent" placeholder="MM / YY" autoComplete="cc-exp" />
              <input className="w-1/2 rounded-xl border border-luxa-border bg-luxa-bg px-4 py-3 text-sm outline-none focus:border-luxa-accent" placeholder="CVC" autoComplete="cc-csc" />
            </div>
          </div>
          <button
            type="button"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-luxa-accent py-3.5 text-sm font-bold text-white hover:bg-luxa-accentHover"
            onClick={() => alert(`Demo: charge €${price.toFixed(2)} via Stripe for @${creator.handle}`)}
          >
            <Lock size={16} /> Pay €{price.toFixed(2)}
          </button>
        </div>
        <p className="mt-4 text-center text-[11px] text-luxa-muted">18+ · GDPR · EU consumer rights · Secure card processing</p>
      </div>
    </main>
  );
}
