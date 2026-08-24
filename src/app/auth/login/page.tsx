"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { XAuthButton } from "@/components/XAuthButton";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  const input =
    "w-full rounded-xl border border-luxa-border bg-luxa-card px-4 py-3 text-sm outline-none focus:border-luxa-accent";

  return (
    <main className="mx-auto w-full max-w-md min-w-0 px-4 py-16">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="mt-1 text-sm text-luxa-muted">Luxa · 18+</p>

      <div className="mt-8">
        <XAuthButton next={next} />
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-luxa-border" />
        <span className="text-xs text-luxa-muted">or email</span>
        <div className="h-px flex-1 bg-luxa-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={input}
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-luxa-accent py-3 text-sm font-bold text-white hover:bg-luxa-accentHover disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-luxa-muted">
        No account?{" "}
        <Link href="/auth/signup" className="text-luxa-accent hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-luxa-muted">Loading…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
