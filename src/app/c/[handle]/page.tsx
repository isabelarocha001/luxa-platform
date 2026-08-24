import { notFound } from "next/navigation";
import { DEMO_CREATORS, getCreatorByHandle } from "@/lib/demo-data";
import { CreatorProfile } from "@/components/CreatorProfile";

export function generateStaticParams() {
  return DEMO_CREATORS.map((c) => ({ handle: c.handle }));
}

export default async function CreatorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const creator = getCreatorByHandle(handle);
  if (!creator) notFound();
  return <CreatorProfile creator={creator} />;
}
