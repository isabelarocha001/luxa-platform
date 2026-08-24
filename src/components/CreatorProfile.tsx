"use client";

import Link from "next/link";
import {
  Image as ImageIcon,
  Video,
  Heart,
  Share2,
  Lock,
  Play,
  MapPin,
} from "lucide-react";
import type { Creator } from "@/lib/demo-data";

/**
 * Perfil criadora — fluido mobile → desktop.
 * Evita overflow: truncate, min-w-0, flex-wrap, sticky CTA com safe-area.
 */
export function CreatorProfile({ creator }: { creator: Creator }) {
  return (
    <div className="mx-auto w-full max-w-3xl min-w-0 pb-28 lg:max-w-4xl lg:pb-10">
      <div className="relative h-36 w-full overflow-hidden bg-luxa-card xs:h-40 sm:h-52 md:h-64">
        <img
          src={creator.banner}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxa-bg/80 to-transparent" />
        <div className="absolute bottom-2 left-3 right-12 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-white/90 drop-shadow sm:bottom-3 sm:left-4 sm:text-xs">
          <span className="inline-flex items-center gap-1">
            <ImageIcon size={14} className="shrink-0" />{" "}
            {formatCount(creator.stats.photos)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Video size={14} className="shrink-0" />{" "}
            {formatCount(creator.stats.videos)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart size={14} className="shrink-0" /> {creator.stats.likes}
          </span>
        </div>
        <button
          type="button"
          className="absolute right-2 top-2 rounded-full bg-black/40 p-2 text-white backdrop-blur sm:right-3 sm:top-3"
          aria-label="Share"
        >
          <Share2 size={16} />
        </button>
      </div>

      <div className="min-w-0 px-3 sm:px-6">
        <div className="-mt-10 flex items-end justify-between gap-2 sm:-mt-12">
          <img
            src={creator.avatar}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full border-4 border-luxa-bg object-cover shadow-lg sm:h-24 sm:w-24"
          />
          {creator.online && (
            <span className="mb-1 shrink-0 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
              Online
            </span>
          )}
        </div>

        <div className="mt-3 min-w-0">
          <h1 className="break-anywhere text-xl font-bold sm:text-2xl">
            {creator.displayName}
            {creator.verified && (
              <span
                className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-luxa-accent text-[11px] text-white"
                title="Verified"
              >
                ✓
              </span>
            )}
          </h1>
          <p className="truncate text-sm text-luxa-muted">
            @{creator.handle}
            {creator.online ? " · Seen just now" : ""}
          </p>
        </div>

        <p className="mt-3 break-anywhere whitespace-pre-line text-sm leading-relaxed text-luxa-text/90">
          {creator.bio}
        </p>
        {creator.location && (
          <p className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-xs text-luxa-muted">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{creator.location}</span>
          </p>
        )}

        <div className="mt-5 min-w-0 rounded-2xl border border-luxa-border bg-luxa-card p-3 sm:mt-6 sm:p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-luxa-muted">
            Subscription
          </p>
          <Link
            href={`/c/${creator.handle}/subscribe`}
            className="mt-3 flex w-full min-w-0 flex-wrap items-center justify-between gap-2 rounded-full bg-luxa-accent px-4 py-3 text-sm font-bold text-white shadow-lg shadow-luxa-accent/20 transition hover:bg-luxa-accentHover sm:px-5 sm:py-3.5"
          >
            <span className="shrink-0">SUBSCRIBE</span>
            <span className="min-w-0 truncate">
              €{creator.priceMonthly.toFixed(2)} / month
            </span>
          </Link>
          {creator.bundles.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-luxa-muted">
                Subscription bundles
              </p>
              <div className="flex flex-col gap-2">
                {creator.bundles.map((b) => (
                  <Link
                    key={b.months}
                    href={`/c/${creator.handle}/subscribe?plan=${b.months}`}
                    className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-full border border-luxa-border bg-luxa-surface px-3 py-2.5 text-xs font-semibold transition hover:border-luxa-accent/40 sm:px-4 sm:py-3 sm:text-sm"
                  >
                    <span className="min-w-0 break-anywhere">
                      {b.months} MONTHS{" "}
                      <span className="text-luxa-accent">
                        ({b.discountPct}% off)
                      </span>
                    </span>
                    <span className="shrink-0 text-luxa-muted">
                      €{b.total.toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-6 border-b border-luxa-border pb-3 text-center text-sm">
          <div>
            <p className="font-bold">{creator.postsCount}</p>
            <p className="text-xs text-luxa-muted">POSTS</p>
          </div>
          <div>
            <p className="font-bold">{creator.mediaCount}</p>
            <p className="text-xs text-luxa-muted">MEDIA</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {creator.media.map((item) => (
            <Link
              key={item.id}
              href={`/c/${creator.handle}/subscribe`}
              className="group relative aspect-[4/5] min-w-0 overflow-hidden rounded-lg bg-luxa-card"
            >
              <img
                src={item.thumb}
                alt=""
                className={`h-full w-full object-cover ${
                  item.locked ? "lock-blur" : ""
                }`}
              />
              {item.locked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/35 px-1 text-center text-white">
                  <Lock size={20} className="shrink-0" />
                  <span className="text-[9px] font-semibold uppercase leading-tight tracking-wide sm:text-[10px]">
                    Subscribe to unlock
                  </span>
                </div>
              )}
              {item.type === "video" && (
                <span className="absolute left-2 top-2 rounded bg-black/50 p-1">
                  <Play size={12} fill="white" className="text-white" />
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Sticky CTA mobile — acima da bottom nav (pb considera nav ~56px + safe) */}
      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-luxa-border bg-luxa-bg/95 p-2 pb-safe backdrop-blur sm:p-3 lg:hidden">
        <Link
          href={`/c/${creator.handle}/subscribe`}
          className="mx-auto flex w-full max-w-lg min-w-0 flex-wrap items-center justify-between gap-2 rounded-full bg-luxa-accent px-4 py-3 text-sm font-bold text-white"
        >
          <span className="shrink-0">SUBSCRIBE</span>
          <span className="min-w-0 truncate">
            €{creator.priceMonthly.toFixed(2)} / mo
          </span>
        </Link>
      </div>
    </div>
  );
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}
