"use client";

import { useEffect, useState } from "react";
import { formatLastSeen, isOnline } from "@/lib/presence";

/** Live relative presence text — re-renders every 30s */
export function PresenceLabel({
  lastSeenAt,
  className = "",
}: {
  lastSeenAt: string | null;
  className?: string;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const online = isOnline(lastSeenAt);
  const text = formatLastSeen(lastSeenAt);

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={lastSeenAt ? new Date(lastSeenAt).toLocaleString() : undefined}
    >
      <span
        className={`inline-block h-2 w-2 shrink-0 rounded-full ${
          online ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-luxa-muted/50"
        }`}
      />
      <span className={online ? "text-emerald-400" : "text-luxa-muted"}>
        {text}
      </span>
    </span>
  );
}
