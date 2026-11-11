import { describe, expect, it } from "vitest";
import { deckSlot, ringOffset, shuffleGallery, wrapsAcrossDeck } from "./gallery";

describe("shuffleGallery", () => {
  const items = Array.from({ length: 30 }, (_, i) => i);

  it("keeps the first item in place and caps the length", () => {
    const out = shuffleGallery(items, 20);
    expect(out).toHaveLength(20);
    expect(out[0]).toBe(0);
    expect(new Set(out).size).toBe(20);
  });

  it("keeps every item when no cap is given", () => {
    const out = shuffleGallery(items);
    expect(out).toHaveLength(30);
    expect(out[0]).toBe(0);
    expect(new Set(out).size).toBe(30);
  });

  it("returns every item once when under the cap", () => {
    const out = shuffleGallery(items.slice(0, 5), 20);
    expect([...out].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
  });

  it("produces different orders for different random sources", () => {
    const a = shuffleGallery(items, 20, () => 0);
    const b = shuffleGallery(items, 20, () => 0.999);
    expect(a).not.toEqual(b);
  });

  it("does not mutate its input", () => {
    const input = items.slice(0, 10);
    shuffleGallery(input, 20, () => 0);
    expect(input).toEqual(items.slice(0, 10));
  });

  it("handles an empty list", () => {
    expect(shuffleGallery([], 20)).toEqual([]);
  });
});

describe("ringOffset", () => {
  it("gives the signed shortest distance around the ring", () => {
    const offsets = [0, 1, 2, 3, 4].map((i) => ringOffset(i, 0, 5));
    expect(offsets).toEqual([0, 1, 2, -2, -1]);
  });

  it("wraps from the last slide to the first", () => {
    expect(ringOffset(0, 4, 5)).toBe(1);
    expect(ringOffset(4, 0, 5)).toBe(-1);
  });

  it("is 0 when there is a single slide", () => {
    expect(ringOffset(0, 0, 1)).toBe(0);
  });

  it("puts the other slide of a pair on the positive side from either end", () => {
    expect(ringOffset(1, 0, 2)).toBe(1);
    expect(ringOffset(0, 1, 2)).toBe(1);
  });

  it("returns the positive value at exactly half an even ring", () => {
    expect(ringOffset(2, 0, 4)).toBe(2);
    expect(ringOffset(0, 2, 4)).toBe(2);
  });
});

describe("deckSlot", () => {
  it("puts the current slide front and centre", () => {
    expect(deckSlot(0, true)).toEqual({ x: 0, scale: 1, rotateY: 0, opacity: 1, blur: 0, zIndex: 10 });
  });

  it("tilts neighbours towards the centre, mirrored left and right", () => {
    // Positive CSS rotateY pulls the right edge towards the viewer, so the left
    // neighbour needs a negative angle for its face to turn towards the centre.
    expect(deckSlot(-1, true).rotateY).toBe(-28);
    expect(deckSlot(1, true).rotateY).toBe(28);
    expect(deckSlot(1, true)).toMatchObject({ x: 78, scale: 0.78, opacity: 0.45, blur: 3, zIndex: 5 });
    expect(deckSlot(-1, true).x).toBe(-78);
  });

  it("fades out slides two or more away, on their own side", () => {
    expect(deckSlot(3, true)).toMatchObject({ opacity: 0, scale: 0.6, x: 110, zIndex: 1 });
    expect(deckSlot(-2, true).x).toBe(-110);
  });

  it("hides every neighbour when neighbours are off", () => {
    expect(deckSlot(1, false)).toMatchObject({ opacity: 0, scale: 1, rotateY: 0, x: 0, zIndex: 1 });
    expect(deckSlot(0, false).opacity).toBe(1);
  });
});

describe("wrapsAcrossDeck", () => {
  it("is false for a slide moving one place or staying put", () => {
    expect(wrapsAcrossDeck(0, 1)).toBe(false);
    expect(wrapsAcrossDeck(1, 0)).toBe(false);
    expect(wrapsAcrossDeck(-1, 0)).toBe(false);
    expect(wrapsAcrossDeck(1, 1)).toBe(false);
  });

  it("is true when a slide would have to cross the deck to its new place", () => {
    // 3 slides: on "next", the left neighbour (-1) becomes the right one (+1).
    expect(wrapsAcrossDeck(-1, 1)).toBe(true);
    expect(wrapsAcrossDeck(1, -1)).toBe(true);
    // 4 slides: -1 becomes +2.
    expect(wrapsAcrossDeck(-1, 2)).toBe(true);
  });
});
