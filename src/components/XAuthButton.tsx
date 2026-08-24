"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Sign in with X (Twitter) via Supabase Auth provider `twitter`.
 * Requires Twitter enabled in Supabase Dashboard with API Key + Secret.
 * Docs: docs/AUTH_X.md
 */
export function XAuthButton({ next = "/" }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithX() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo,
        },
      });

      if (err) {
        setError(err.message);
        setLoading(false);
      }
      // On success browser redirects to X
    } catch (e) {
      setError(e instanceof Error ? e.message : "X login failed");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={signInWithX}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-luxa-border bg-black py-3 text-sm font-bold text-white transition hover:bg-zinc-900 disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.227-8.26L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
        {loading ? "Redirecting…" : "Continue with X"}
      </button>
      {error && (
        <p className="mt-2 break-anywhere text-center text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
