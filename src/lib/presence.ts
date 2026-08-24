/**
 * Creator presence (OnlyFans-style).
 * - Heartbeat pings every HEARTBEAT_MS (1 minute)
 * - "Available now" if last_seen within ONLINE_WINDOW_MS (~2 min buffer after 1 min ping)
 * - Otherwise "Last seen …"
 */

/** How often the client POSTs /api/presence/heartbeat */
export const HEARTBEAT_MS = 60_000; // 1 minute

/**
 * Slightly > 1 ping interval so a creator stays "Available now"
 * between successful 1-min pings (network jitter).
 */
export const ONLINE_WINDOW_MS = 2 * 60_000; // 2 minutes

export function isOnline(lastSeenAt: string | Date | null | undefined): boolean {
  if (!lastSeenAt) return false;
  const t =
    typeof lastSeenAt === "string"
      ? new Date(lastSeenAt).getTime()
      : lastSeenAt.getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < ONLINE_WINDOW_MS;
}

export function formatLastSeen(
  lastSeenAt: string | Date | null | undefined,
): string {
  if (!lastSeenAt) return "Offline";
  const t =
    typeof lastSeenAt === "string"
      ? new Date(lastSeenAt).getTime()
      : lastSeenAt.getTime();
  if (Number.isNaN(t)) return "Offline";

  const diff = Date.now() - t;
  if (diff < ONLINE_WINDOW_MS) return "Available now";

  const mins = Math.max(1, Math.floor(diff / 60_000));
  if (mins < 60) return `Last seen ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Last seen ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Last seen ${days}d ago`;
  return `Last seen ${new Date(t).toLocaleDateString()}`;
}
