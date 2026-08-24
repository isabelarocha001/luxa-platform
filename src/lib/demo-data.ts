/**
 * @deprecated Demo profiles removed. Use @/lib/creators + @/lib/types.
 * File kept only so old imports fail clearly if any remain.
 */
export type { Creator, MediaItem } from "@/lib/types";

export const DEMO_CREATORS: never[] = [];

export function getCreatorByHandle(_handle: string): undefined {
  return undefined;
}
