"use client";

import { useMemo, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2, X } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

function PaymentForm({
  returnUrl,
  onSuccess,
  amountLabel,
}: {
  returnUrl: string;
  onSuccess: () => void;
  amountLabel: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError(null);

    const { error: err, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });

    if (err) {
      setError(err.message || "Payment failed");
      setBusy(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess();
      return;
    }

    if (
      paymentIntent &&
      (paymentIntent.status === "processing" ||
        paymentIntent.status === "requires_capture")
    ) {
      onSuccess();
      return;
    }

    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="min-w-0 space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
          paymentMethodOrder: ["card"],
        }}
      />
      {error && (
        <p className="break-anywhere text-sm text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={!stripe || busy}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-luxa-accent py-3.5 text-sm font-bold text-white hover:bg-luxa-accentHover disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Processing…
          </>
        ) : (
          <>Pay {amountLabel}</>
        )}
      </button>
    </form>
  );
}

/** Modal de pagamento — sheet no mobile, centrado no desktop; scroll interno se altura for baixa */
export function StripePaymentModal({
  clientSecret,
  amountLabel,
  returnUrl,
  onClose,
  onSuccess,
}: {
  clientSecret: string;
  amountLabel: string;
  returnUrl: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "night" as const,
        variables: {
          colorPrimary: "#00aeef",
          colorBackground: "#1a1a1e",
          colorText: "#f4f4f5",
          colorDanger: "#f87171",
          borderRadius: "12px",
        },
      },
    }),
    [clientSecret],
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="luxa-sheet relative z-10 w-full max-w-md min-w-0 rounded-t-2xl border border-luxa-border bg-luxa-card p-4 shadow-2xl sm:rounded-2xl sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-luxa-muted">
              Card payment
            </p>
            <p className="truncate text-lg font-bold">{amountLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-luxa-muted hover:bg-luxa-surface hover:text-luxa-text"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
          <p className="break-anywhere text-sm text-red-400">
            Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY on Vercel.
          </p>
        ) : (
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm
              returnUrl={returnUrl}
              onSuccess={onSuccess}
              amountLabel={amountLabel}
            />
          </Elements>
        )}

        <p className="mt-4 text-center text-[10px] text-luxa-muted">
          Secure card form powered by Stripe · stays on Luxa
        </p>
      </div>
    </div>
  );
}
