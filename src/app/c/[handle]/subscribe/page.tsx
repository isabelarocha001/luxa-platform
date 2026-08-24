import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCreatorByHandle } from "@/lib/demo-data";
import { SubscribeCheckout } from "@/components/SubscribeCheckout";

export default async function SubscribePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const creator = getCreatorByHandle(handle);
  if (!creator) notFound();
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-luxa-muted">Loading…</div>}>
      <SubscribeCheckout creator={creator} />
    </Suspense>
  );
}
