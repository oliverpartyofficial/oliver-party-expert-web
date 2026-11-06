import { describe, expect, it } from "vitest";
import type { GalleryItem } from "@/content/catalog";
import { mergeGalleryItems, shuffleGallery } from "./gallery";

const photo = (src: string): GalleryItem => ({ kind: "image", src });

describe("mergeGalleryItems", () => {
  it("appends channel videos after the catalog, using the title as alt", () => {
    const merged = mergeGalleryItems([photo("/a.jpg")], [{ youtubeId: "vid00000001", title: "Boda" }]);
    expect(merged).toEqual([
      photo("/a.jpg"),
      { kind: "youtube", youtubeId: "vid00000001", altEs: "Boda", altEn: "Boda" },
    ]);
  });

  it("does not duplicate a video that is already in the catalog or repeated in the feed", () => {
    const catalog: GalleryItem[] = [{ kind: "youtube", youtubeId: "vid00000001", event: "corporate" }];
    const merged = mergeGalleryItems(catalog, [
      { youtubeId: "vid00000001", title: "Same" },
      { youtubeId: "vid00000002", title: "New" },
      { youtubeId: "vid00000002", title: "New again" },
    ]);
    expect(merged.map((i) => (i.kind === "youtube" ? i.youtubeId : i.src))).toEqual([
      "vid00000001",
      "vid00000002",
    ]);
    expect(merged[0]).toBe(catalog[0]);
  });

  it("leaves alt unset for an untitled video so the generated alt is used", () => {
    const [video] = mergeGalleryItems([], [{ youtubeId: "vid00000003", title: "" }]);
    expect(video.altEs).toBeUndefined();
  });
});

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
