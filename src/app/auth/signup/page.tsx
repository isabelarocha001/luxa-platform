"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || undefined, role: "fan" } },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data.session) { router.push("/"); router.refresh(); return; }
    setMsg("Check your email to confirm (if confirmation is enabled).");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Create account</h1>
      <p className="mt-1 text-sm text-luxa-muted">Fan account · Card payments · 18+</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input type="text" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-xl border border-luxa-border bg-luxa-card px-4 py-3 text-sm outline-none focus:border-luxa-accent" />
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-luxa-border bg-luxa-card px-4 py-3 text-sm outline-none focus:border-luxa-accent" />
        <input type="password" required minLength={6} placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-luxa-border bg-luxa-card px-4 py-3 text-sm outline-none focus:border-luxa-accent" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded-full bg-luxa-accent py-3 text-sm font-bold text-white hover:bg-luxa-accentHover disabled:opacity-60">
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-luxa-muted">
        Already have an account? <Link href="/auth/login" className="text-luxa-accent hover:underline">Log in</Link>
      </p>
    </main>
  );
}
