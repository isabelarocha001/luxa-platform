import Link from "next/link";
import { listActiveCreators } from "@/lib/creators";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const creators = await listActiveCreators();

  return (
    <main className="mx-auto w-full max-w-5xl min-w-0 px-3 py-8 sm:px-4 sm:py-10">
      <section className="mb-8 text-center sm:mb-10">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-luxa-accent sm:text-sm">
          Europe · Card payments only
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          Luxa
        </h1>
        <p className="mx-auto mt-3 max-w-xl break-anywhere px-1 text-sm text-luxa-muted sm:text-base">
          Creator platform for the European audience. Subscribe with card.
        </p>
      </section>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-luxa-muted">
        Creators
      </h2>

      {!creators.length && (
        <div className="rounded-2xl border border-dashed border-luxa-border bg-luxa-card/50 px-4 py-12 text-center">
          <p className="text-sm text-luxa-muted">No creators yet.</p>
          <p className="mt-1 text-xs text-luxa-muted/70">
            Admins can add creators in /admin/creators
          </p>
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
              <img
                src={c.avatar}
                alt=""
                className="absolute -top-8 left-3 h-14 w-14 rounded-full border-4 border-luxa-card object-cover sm:left-4 sm:h-16 sm:w-16"
              />
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold group-hover:text-luxa-accent">
                    {c.displayName}
                    {c.verified && (
                      <span className="ml-1 text-luxa-accent">✓</span>
                    )}
                  </p>
                  <p className="truncate text-sm text-luxa-muted">@{c.handle}</p>
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
