import Link from "next/link";
import { getCreatorByHandle } from "@/lib/creators";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SubscribeSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { handle } = await params;
  const { session_id } = await searchParams;
  const creator = await getCreatorByHandle(handle);
  if (!creator) notFound();

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="rounded-2xl border border-luxa-border bg-luxa-card p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Payment received
        </p>
        <h1 className="mt-2 text-2xl font-bold">You are subscribed</h1>
        <p className="mt-2 text-sm text-luxa-muted">
          Welcome to @{creator.handle}. Your card subscription is active.
        </p>
        {session_id && (
          <p className="mt-4 break-all text-[10px] text-luxa-muted/60">
            Session: {session_id}
          </p>
        )}
        <Link
          href={`/c/${creator.handle}`}
          className="mt-8 inline-flex rounded-full bg-luxa-accent px-6 py-3 text-sm font-bold text-white hover:bg-luxa-accentHover"
        >
          Go to profile
        </Link>
      </div>
    </main>
  );
}
