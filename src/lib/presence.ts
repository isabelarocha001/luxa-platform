/**
 * Creator presence (OnlyFans-style).
 * - Online / "Available now" if last_seen_at within ONLINE_WINDOW_MS
 * - Otherwise "Last seen …" relative text
 * - Updated by POST /api/presence/heartbeat when a creator is logged in on the site
 */

export const ONLINE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function isOnline(lastSeenAt: string | Date | null | undefined): boolean {
  if (!lastSeenAt) return false;
  const t = typeof lastSeenAt === "string" ? new Date(lastSeenAt).getTime() : lastSeenAt.getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < ONLINE_WINDOW_MS;
}

export function formatLastSeen(
  lastSeenAt: string | Date | null | undefined,
): string {
  if (!lastSeenAt) return "Offline";
  const t = typeof lastSeenAt === "string" ? new Date(lastSeenAt).getTime() : lastSeenAt.getTime();
  if (Number.isNaN(t)) return "Offline";

  const diff = Date.now() - t;
  if (diff < ONLINE_WINDOW_MS) return "Available now";

  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Last seen ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Last seen ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Last seen ${days}d ago`;
  return `Last seen ${new Date(t).toLocaleDateString()}`;
}
