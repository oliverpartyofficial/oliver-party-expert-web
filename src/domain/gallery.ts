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

/**
 * Signed shortest distance from the current slide to `index` around a ring of
 * `total` slides (negative = to the left). Exactly half an even ring counts as
 * positive so the result never flips sign between two equal choices.
 */
export function ringOffset(index: number, current: number, total: number): number {
  if (total <= 1) return 0;
  let offset = (((index - current) % total) + total) % total;
  if (offset > total / 2) offset -= total;
  return offset;
}

/** Transform for one slide in the 3D deck; `x` is a percentage of the frame width. */
export type DeckSlot = {
  x: number;
  scale: number;
  rotateY: number;
  opacity: number;
  blur: number;
  zIndex: number;
};

const NEIGHBOUR_TILT_DEG = 28;

export function deckSlot(offset: number, neighbours: boolean): DeckSlot {
  if (offset === 0) return { x: 0, scale: 1, rotateY: 0, opacity: 1, blur: 0, zIndex: 10 };
  if (!neighbours) return { x: 0, scale: 1, rotateY: 0, opacity: 0, blur: 0, zIndex: 1 };
  if (Math.abs(offset) === 1) {
    return { x: offset * 78, scale: 0.78, rotateY: -offset * NEIGHBOUR_TILT_DEG, opacity: 0.45, blur: 3, zIndex: 5 };
  }
  return { x: Math.sign(offset) * 110, scale: 0.6, rotateY: 0, opacity: 0, blur: 0, zIndex: 1 };
}
