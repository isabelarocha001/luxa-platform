"use client";

import { useEffect } from "react";

/**
 * Pings /api/presence/heartbeat every 60s when the tab is visible.
 * Only affects rows where luxa_creators.user_id = current user.
 */
export function PresenceHeartbeat() {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    async function beat() {
      if (document.visibilityState !== "visible") return;
      try {
        await fetch("/api/presence/heartbeat", { method: "POST" });
      } catch {
        // ignore network errors
      }
    }

    beat();
    timer = setInterval(beat, 60_000);

    const onVis = () => {
      if (document.visibilityState === "visible") beat();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return null;
}
