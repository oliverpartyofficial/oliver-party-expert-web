import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import { existsSync } from "node:fs";
import path from "node:path";
import { GALLERY_ITEMS, galleryItemKey, tiktokVideoId } from "./catalog";
import { EVENT_TYPES } from "./company";

describe("GALLERY_ITEMS", () => {
  it("has no duplicate entries", () => {
    const keys = GALLERY_ITEMS.map(galleryItemKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses full TikTok links the video id can be read from", () => {
    for (const item of GALLERY_ITEMS) {
      if (item.kind === "tiktok") expect(tiktokVideoId(item.url), item.url).not.toBeNull();
    }
  });

  it("mixes photos with TikTok videos", () => {
    expect(GALLERY_ITEMS.some((item) => item.kind === "image")).toBe(true);
    expect(GALLERY_ITEMS.some((item) => item.kind === "tiktok")).toBe(true);
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

describe("tiktokVideoId", () => {
  it("reads the id from a full video link, with or without query string", () => {
    expect(tiktokVideoId("https://www.tiktok.com/@oliverpartyexpert/video/7301234567890123456")).toBe(
      "7301234567890123456",
    );
    expect(
      tiktokVideoId("https://www.tiktok.com/@some.user_1/video/7301234567890123456?is_from_webapp=1&sender_device=pc"),
    ).toBe("7301234567890123456");
  });

  it("returns null for short share links and non-video links", () => {
    expect(tiktokVideoId("https://vm.tiktok.com/ZMabc123/")).toBeNull();
    expect(tiktokVideoId("https://www.tiktok.com/@oliverpartyexpert")).toBeNull();
    expect(tiktokVideoId("")).toBeNull();
  });
});
