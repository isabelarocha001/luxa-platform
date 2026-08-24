"use client";

import Link from "next/link";
import { Image as ImageIcon, Video, Heart, Share2, Lock, Play, MapPin } from "lucide-react";
import type { Creator } from "@/lib/demo-data";

export function CreatorProfile({ creator }: { creator: Creator }) {
  return (
    <div className="mx-auto max-w-3xl pb-24 lg:max-w-4xl lg:pb-10">
      <div className="relative h-44 overflow-hidden bg-luxa-card sm:h-56 md:h-64">
        <img src={creator.banner} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxa-bg/80 to-transparent" />
        <div className="absolute bottom-3 left-4 flex flex-wrap gap-4 text-xs font-medium text-white/90 drop-shadow">
          <span className="inline-flex items-center gap-1"><ImageIcon size={14} /> {formatCount(creator.stats.photos)}</span>
          <span className="inline-flex items-center gap-1"><Video size={14} /> {formatCount(creator.stats.videos)}</span>
          <span className="inline-flex items-center gap-1"><Heart size={14} /> {creator.stats.likes}</span>
        </div>
        <button type="button" className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white backdrop-blur" aria-label="Share">
          <Share2 size={16} />
        </button>
      </div>

      <div className="px-4 sm:px-6">
        <div className="-mt-12 flex items-end justify-between gap-3">
          <img src={creator.avatar} alt="" className="h-24 w-24 rounded-full border-4 border-luxa-bg object-cover shadow-lg" />
          {creator.online && (
            <span className="mb-2 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">Online</span>
          )}
        </div>

        <div className="mt-3">
          <h1 className="text-2xl font-bold">
            {creator.displayName}
            {creator.verified && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-luxa-accent text-[11px] text-white" title="Verified">✓</span>
            )}
          </h1>
          <p className="text-sm text-luxa-muted">@{creator.handle}{creator.online ? " · Seen just now" : ""}</p>
        </div>

        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-luxa-text/90">{creator.bio}</p>
        {creator.location && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-luxa-muted"><MapPin size={12} /> {creator.location}</p>
        )}

        <div className="mt-6 rounded-2xl border border-luxa-border bg-luxa-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-luxa-muted">Subscription</p>
          <Link href={`/c/${creator.handle}/subscribe`} className="mt-3 flex w-full items-center justify-between rounded-full bg-luxa-accent px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-luxa-accent/20 transition hover:bg-luxa-accentHover">
            <span>SUBSCRIBE</span>
            <span>€{creator.priceMonthly.toFixed(2)} / month</span>
          </Link>
          {creator.bundles.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-luxa-muted">Subscription bundles</p>
              <div className="flex flex-col gap-2">
                {creator.bundles.map((b) => (
                  <Link key={b.months} href={`/c/${creator.handle}/subscribe?plan=${b.months}`} className="flex items-center justify-between rounded-full border border-luxa-border bg-luxa-surface px-4 py-3 text-sm font-semibold transition hover:border-luxa-accent/40">
                    <span>{b.months} MONTHS <span className="text-luxa-accent">({b.discountPct}% off)</span></span>
                    <span className="text-luxa-muted">€{b.total.toFixed(2)} total</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-6 border-b border-luxa-border pb-3 text-center text-sm">
          <div><p className="font-bold">{creator.postsCount}</p><p className="text-xs text-luxa-muted">POSTS</p></div>
          <div><p className="font-bold">{creator.mediaCount}</p><p className="text-xs text-luxa-muted">MEDIA</p></div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {creator.media.map((item) => (
            <Link key={item.id} href={`/c/${creator.handle}/subscribe`} className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-luxa-card">
              <img src={item.thumb} alt="" className={`h-full w-full object-cover ${item.locked ? "lock-blur" : ""}`} />
              {item.locked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/35 text-white">
                  <Lock size={22} />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Subscribe to unlock</span>
                </div>
              )}
              {item.type === "video" && (
                <span className="absolute left-2 top-2 rounded bg-black/50 p-1"><Play size={12} fill="white" className="text-white" /></span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-luxa-border bg-luxa-bg/95 p-3 backdrop-blur lg:hidden">
        <Link href={`/c/${creator.handle}/subscribe`} className="flex w-full items-center justify-between rounded-full bg-luxa-accent px-5 py-3.5 text-sm font-bold text-white">
          <span>SUBSCRIBE</span>
          <span>€{creator.priceMonthly.toFixed(2)} / mo</span>
        </Link>
      </div>
    </div>
  );
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}
