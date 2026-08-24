export type Creator = {
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
  online: boolean;
  media: MediaItem[];
};

export type MediaItem = {
  id: string;
  type: "photo" | "video";
  thumb: string;
  locked: boolean;
  likes: number;
};

export const DEMO_CREATORS: Creator[] = [
  {
    handle: "luzcervo",
    displayName: "Luz Cervo",
    verified: true,
    bio: "Your muse of forbidden dreams 🔥\nNo censorship here 🚫 — only the most sensual version of me 💗",
    location: "Europe",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop",
    priceMonthly: 17,
    bundles: [
      { months: 3, total: 43.35, discountPct: 15 },
      { months: 6, total: 81.6, discountPct: 20 },
      { months: 12, total: 153, discountPct: 25 },
    ],
    stats: { photos: 1300, videos: 152, likes: "50.4K" },
    postsCount: 431,
    mediaCount: 1504,
    online: true,
    media: Array.from({ length: 12 }).map((_, i) => ({
      id: `m${i + 1}`,
      type: i % 3 === 0 ? "video" : "photo",
      thumb: `https://images.unsplash.com/photo-${["1529626455594-4ff0802cfb7e","1517841905240-472988babdf9","1531746020798-e6953c6e8e04","1494790108377-be9c29b29330","1524504388940-b1c1722653e1","1502823403499-6ccfcf4fb453"][i % 6]}?w=400&h=500&fit=crop`,
      locked: true,
      likes: 120 + i * 17,
    })),
  },
  {
    handle: "sofia-eu",
    displayName: "Sofia",
    verified: true,
    bio: "Exclusive sets · weekly drops · EU creators only ✨",
    location: "Berlin, DE",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop",
    priceMonthly: 12.99,
    bundles: [
      { months: 3, total: 33, discountPct: 15 },
      { months: 6, total: 62, discountPct: 20 },
    ],
    stats: { photos: 420, videos: 88, likes: "12.1K" },
    postsCount: 210,
    mediaCount: 508,
    online: false,
    media: Array.from({ length: 9 }).map((_, i) => ({
      id: `s${i + 1}`,
      type: i % 2 === 0 ? "photo" : "video",
      thumb: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
      locked: true,
      likes: 40 + i * 9,
    })),
  },
];

export function getCreatorByHandle(handle: string): Creator | undefined {
  return DEMO_CREATORS.find((c) => c.handle.toLowerCase() === handle.toLowerCase());
}
