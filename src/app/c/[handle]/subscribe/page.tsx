import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCreatorByHandle } from "@/lib/creators";
import { SubscribeCheckout } from "@/components/SubscribeCheckout";

export const dynamic = "force-dynamic";

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const creator = await getCreatorByHandle(handle);
  if (!creator) notFound();
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-luxa-muted">Loading…</div>
      }
    >
      <SubscribeCheckout creator={creator} />
    </Suspense>
  );
}
