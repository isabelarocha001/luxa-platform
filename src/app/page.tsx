import Link from "next/link";
import { listActiveCreators } from "@/lib/creators";
import { PresenceLabel } from "@/components/PresenceLabel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const creators = await listActiveCreators();

  return (
    <main className="mx-auto w-full max-w-5xl min-w-0 px-3 py-6 sm:px-4 sm:py-8">
      {!creators.length && (
        <div className="rounded-2xl border border-dashed border-luxa-border bg-luxa-card/50 px-4 py-12 text-center">
          <p className="text-sm text-luxa-muted">No creators yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {creators.map((c) => (
          <Link
            key={c.handle}
            href={`/c/${c.handle}`}
            className="group min-w-0 overflow-hidden rounded-2xl border border-luxa-border bg-luxa-card transition hover:border-luxa-accent/50"
          >
            <div
              className="h-24 bg-cover bg-center sm:h-28"
              style={{ backgroundImage: `url(${c.banner})` }}
            />
            <div className="relative min-w-0 px-3 pb-4 pt-8 sm:px-4">
              <div className="absolute -top-8 left-3 sm:left-4">
                <img
                  src={c.avatar}
                  alt=""
                  className="h-14 w-14 rounded-full border-4 border-luxa-card object-cover sm:h-16 sm:w-16"
                />
                {c.online && (
                  <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-luxa-card bg-emerald-400" />
                )}
              </div>
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-luxa-accent">
                    {c.displayName}
                    {c.verified && (
                      <span className="ml-1 text-luxa-accent">✓</span>
                    )}
                  </p>
                  <p className="truncate text-sm text-luxa-muted">@{c.handle}</p>
                  <p className="mt-1 text-[11px]">
                    <PresenceLabel lastSeenAt={c.lastSeenAt} />
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-luxa-accent/15 px-2.5 py-1 text-xs font-semibold text-luxa-accent">
                  €{c.priceMonthly.toFixed(2)}/mo
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
