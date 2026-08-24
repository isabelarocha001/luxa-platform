import { notFound } from "next/navigation";
import { getCreatorByHandle } from "@/lib/creators";
import { CreatorProfile } from "@/components/CreatorProfile";

export const dynamic = "force-dynamic";

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const creator = await getCreatorByHandle(handle);
  if (!creator) notFound();
  return <CreatorProfile creator={creator} />;
}
