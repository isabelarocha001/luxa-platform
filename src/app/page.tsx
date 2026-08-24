import Link from "next/link";
import { DEMO_CREATORS } from "@/lib/demo-data";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-10 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-luxa-accent">Europe · Card payments only</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Luxa</h1>
        <p className="mx-auto mt-3 max-w-xl text-luxa-muted">Creator platform inspired by OnlyFans &amp; Fansly — built for the European audience. Web first, native apps later.</p>
      </section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-luxa-muted">Featured creators</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_CREATORS.map((c) => (
          <Link key={c.handle} href={`/c/${c.handle}`} className="group overflow-hidden rounded-2xl border border-luxa-border bg-luxa-card transition hover:border-luxa-accent/50">
            <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${c.banner})` }} />
            <div className="relative px-4 pb-4 pt-8">
              <img src={c.avatar} alt="" className="absolute -top-8 left-4 h-16 w-16 rounded-full border-4 border-luxa-card object-cover" />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold group-hover:text-luxa-accent">{c.displayName}{c.verified && <span className="ml-1 text-luxa-accent">✓</span>}</p>
                  <p className="text-sm text-luxa-muted">@{c.handle}</p>
                </div>
                <span className="shrink-0 rounded-full bg-luxa-accent/15 px-2.5 py-1 text-xs font-semibold text-luxa-accent">€{c.priceMonthly}/mo</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
