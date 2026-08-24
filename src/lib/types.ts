/** Shared domain types — no demo data here. */

export type MediaItem = {
  id: string;
  type: "photo" | "video";
  thumb: string;
  locked: boolean;
  likes: number;
};

export type Creator = {
  id: string;
  handle: string;
  displayName: string;
  verified: boolean;
  bio: string;
  location: string;
  avatar: string;
  banner: string;
  priceMonthly: number;
  bundles: { months: number; total: number; discountPct: number }[];
  stats: { photos: number; videos: number; likes: string };
  postsCount: number;
  mediaCount: number;
  /** Derived from lastSeenAt within 5 min */
  online: boolean;
  lastSeenAt: string | null;
  media: MediaItem[];
};
