"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreatorRowActions({
  id,
  isActive,
  isVerified,
}: {
  id: string;
  isActive: boolean;
  isVerified: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/admin/creators/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => patch({ is_active: !isActive })}
        className="rounded-full border border-luxa-border px-2.5 py-1 text-[11px] text-luxa-muted hover:text-luxa-text disabled:opacity-50"
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => patch({ is_verified: !isVerified })}
        className="rounded-full border border-luxa-border px-2.5 py-1 text-[11px] text-luxa-muted hover:text-luxa-text disabled:opacity-50"
      >
        {isVerified ? "Unverify" : "Verify"}
      </button>
    </div>
  );
}
