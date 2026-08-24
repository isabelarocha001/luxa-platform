"use client";

import { useEffect } from "react";
import { HEARTBEAT_MS } from "@/lib/presence";

/**
 * Pings /api/presence/heartbeat every 1 minute while the tab is visible.
 * Updates luxa_creators.last_seen_at when user_id matches the logged-in user.
 */
export function PresenceHeartbeat() {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    async function beat() {
      if (document.visibilityState !== "visible") return;
      try {
        await fetch("/api/presence/heartbeat", {
          method: "POST",
          keepalive: true,
        });
      } catch {
        // ignore network errors
      }
    }

    beat(); // immediate on mount
    timer = setInterval(beat, HEARTBEAT_MS); // every 1 min

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
