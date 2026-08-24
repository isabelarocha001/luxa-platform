import Link from "next/link";
import { getAdminClient } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const db = await getAdminClient();

  const [creators, profiles, subs] = await Promise.all([
    db.from("luxa_creators").select("id", { count: "exact", head: true }),
    db.from("luxa_profiles").select("id", { count: "exact", head: true }),
    db
      .from("luxa_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const cards = [
    { label: "Creators", value: creators.count ?? 0, href: "/admin/creators" },
    { label: "Users (profiles)", value: profiles.count ?? 0, href: "/admin/users" },
    {
      label: "Active subscriptions",
      value: subs.count ?? 0,
      href: "/admin/subscriptions",
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="min-w-0 rounded-2xl border border-luxa-border bg-luxa-card p-4 transition hover:border-luxa-accent/40"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-luxa-muted">
              {c.label}
            </p>
            <p className="mt-2 text-3xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-luxa-border bg-luxa-card p-4">
        <p className="text-sm font-semibold">Quick actions</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/admin/creators"
            className="rounded-full bg-luxa-accent px-4 py-2 text-sm font-semibold text-white"
          >
            + New creator
          </Link>
          <Link
            href="/admin/users"
            className="rounded-full border border-luxa-border px-4 py-2 text-sm text-luxa-muted"
          >
            Manage users
          </Link>
        </div>
      </div>
    </div>
  );
}
