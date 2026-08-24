import { adminDb } from "@/lib/admin";
import { CreateCreatorForm } from "@/components/admin/CreateCreatorForm";
import { CreatorRowActions } from "@/components/admin/CreatorRowActions";
import Link from "next/link";

export default async function AdminCreatorsPage() {
  const db = adminDb();
  const { data: creators, error } = await db
    .from("luxa_creators")
    .select(
      "id, handle, display_name, bio, location, price_monthly_cents, currency, is_active, is_verified, avatar_url, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <div className="min-w-0 space-y-8">
      <section className="rounded-2xl border border-luxa-border bg-luxa-card p-4 sm:p-5">
        <h2 className="text-lg font-bold">Create creator</h2>
        <p className="mt-1 text-xs text-luxa-muted">
          Cria registro em <code>luxa_creators</code>. Handle único (a-z, 0-9,
          _). Preço em EUR.
        </p>
        <div className="mt-4">
          <CreateCreatorForm />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">All creators</h2>
        {error && (
          <p className="text-sm text-red-400">DB error: {error.message}</p>
        )}
        {!creators?.length && !error && (
          <p className="text-sm text-luxa-muted">
            Nenhum creator no banco ainda. Use o formulário acima.
          </p>
        )}
        <div className="space-y-2">
          {creators?.map((c) => (
            <div
              key={c.id}
              className="flex min-w-0 flex-col gap-2 rounded-xl border border-luxa-border bg-luxa-card p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {c.display_name}{" "}
                  <span className="text-luxa-muted">@{c.handle}</span>
                  {c.is_verified ? " ✓" : ""}
                </p>
                <p className="text-xs text-luxa-muted">
                  €{((c.price_monthly_cents || 0) / 100).toFixed(2)}/mo ·{" "}
                  {c.is_active ? (
                    <span className="text-emerald-400">active</span>
                  ) : (
                    <span className="text-red-400">inactive</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/c/${c.handle}`}
                  className="text-xs text-luxa-accent hover:underline"
                >
                  View profile
                </Link>
                <CreatorRowActions
                  id={c.id}
                  isActive={!!c.is_active}
                  isVerified={!!c.is_verified}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
