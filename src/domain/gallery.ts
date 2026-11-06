import { galleryItemKey, type GalleryItem } from "@/content/catalog";

export const GALLERY_MAX_ITEMS = 20;

/**
 * Catalog items first (photos + any hand-picked videos), then channel uploads
 * not already in the catalog. A video's YouTube title becomes its alt text.
 */
export function mergeGalleryItems(
  catalog: GalleryItem[],
  channelVideos: { youtubeId: string; title: string }[],
): GalleryItem[] {
  const seen = new Set(catalog.map(galleryItemKey));
  const fromChannel: GalleryItem[] = [];
  for (const video of channelVideos) {
    if (seen.has(video.youtubeId)) continue;
    seen.add(video.youtubeId);
    const alt = video.title || undefined;
    fromChannel.push({ kind: "youtube", youtubeId: video.youtubeId, altEs: alt, altEn: alt });
  }
  return [...catalog, ...fromChannel];
}

/**
 * Keeps the first item fixed (it is what renders before hydration), shuffles
 * the rest, and caps the total so the carousel stays a reasonable length.
 */
export function shuffleGallery<T>(items: T[], max = GALLERY_MAX_ITEMS, random = Math.random): T[] {
  if (items.length === 0) return [];
  const [first, ...rest] = items;
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [first, ...rest].slice(0, max);
}
