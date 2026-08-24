"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function CreateCreatorForm() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("Europe");
  const [price, setPrice] = useState("17");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/admin/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle,
          displayName,
          bio,
          location,
          priceMonthly: Number(price),
          avatarUrl: avatarUrl || undefined,
          bannerUrl: bannerUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        setLoading(false);
        return;
      }
      setOk(`Created @${data.handle}`);
      setHandle("");
      setDisplayName("");
      setBio("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full min-w-0 rounded-xl border border-luxa-border bg-luxa-bg px-3 py-2.5 text-sm outline-none focus:border-luxa-accent";

  return (
    <form onSubmit={onSubmit} className="grid min-w-0 gap-3 sm:grid-cols-2">
      <input
        className={input}
        required
        placeholder="handle (ex: luzcervo)"
        value={handle}
        onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
        pattern="[a-z0-9_]{3,30}"
      />
      <input
        className={input}
        required
        placeholder="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />
      <input
        className={`${input} sm:col-span-2`}
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <input
        className={input}
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        className={input}
        required
        type="number"
        min="1"
        step="0.01"
        placeholder="Price EUR / month"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        className={input}
        placeholder="Avatar URL (optional)"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
      />
      <input
        className={input}
        placeholder="Banner URL (optional)"
        value={bannerUrl}
        onChange={(e) => setBannerUrl(e.target.value)}
      />
      {error && (
        <p className="break-anywhere text-sm text-red-400 sm:col-span-2">{error}</p>
      )}
      {ok && (
        <p className="text-sm text-emerald-400 sm:col-span-2">{ok}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-full bg-luxa-accent py-2.5 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Saving…
          </>
        ) : (
          "Create creator"
        )}
      </button>
    </form>
  );
}
