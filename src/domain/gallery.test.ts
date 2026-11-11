import { describe, expect, it } from "vitest";
import { shuffleGallery } from "./gallery";

describe("shuffleGallery", () => {
  const items = Array.from({ length: 30 }, (_, i) => i);

  it("keeps the first item in place and caps the length", () => {
    const out = shuffleGallery(items, 20);
    expect(out).toHaveLength(20);
    expect(out[0]).toBe(0);
    expect(new Set(out).size).toBe(20);
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
