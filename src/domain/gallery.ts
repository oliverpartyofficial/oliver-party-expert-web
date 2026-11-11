export const GALLERY_MAX_ITEMS = 20;

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
