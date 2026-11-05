import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import { GALLERY_ITEMS, galleryItemKey } from "./catalog";
import { EVENT_TYPES } from "./company";

describe("GALLERY_ITEMS", () => {
  it("has no duplicate entries", () => {
    const keys = GALLERY_ITEMS.map(galleryItemKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses bare 11-character YouTube ids, not full URLs", () => {
    for (const item of GALLERY_ITEMS) {
      if (item.kind === "youtube") expect(item.youtubeId).toMatch(/^[A-Za-z0-9_-]{11}$/);
    }
  });

  it("points every image at a file in public/", () => {
    for (const item of GALLERY_ITEMS) {
      if (item.kind === "image") {
        expect(existsSync(path.join(process.cwd(), "public", item.src)), item.src).toBe(true);
      }
    }
  });

  it("has a generated-alt phrase for every event type in both locales", () => {
    for (const messages of [es, en]) {
      for (const type of EVENT_TYPES) expect(messages.gallery.events[type]).toBeTruthy();
    }
  });
});
