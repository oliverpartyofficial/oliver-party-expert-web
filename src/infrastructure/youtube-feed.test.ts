import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchYoutubeVideos, parseYoutubeFeed } from "./youtube-feed";

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns="http://www.w3.org/2005/Atom">
  <title>Oliver Party Expert</title>
  <entry>
    <id>yt:video:ZxkUzuG64zE</id>
    <yt:videoId>ZxkUzuG64zE</yt:videoId>
    <title>Evento corporativo &amp; DJ en directo</title>
  </entry>
  <entry>
    <id>yt:video:abcDEF12345</id>
    <yt:videoId>abcDEF12345</yt:videoId>
    <title>Boda en la playa &#128151;</title>
  </entry>
</feed>`;

describe("parseYoutubeFeed", () => {
  it("extracts video ids and decoded titles, ignoring the channel title", () => {
    expect(parseYoutubeFeed(FEED)).toEqual([
      { youtubeId: "ZxkUzuG64zE", title: "Evento corporativo & DJ en directo" },
      { youtubeId: "abcDEF12345", title: "Boda en la playa 💗" },
    ]);
  });

  it("returns nothing for an empty or unrelated document", () => {
    expect(parseYoutubeFeed("")).toEqual([]);
    expect(parseYoutubeFeed("<html>not a feed</html>")).toEqual([]);
  });
});

describe("fetchYoutubeVideos", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("skips the request when no channel is configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchYoutubeVideos("")).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requests the channel feed and parses it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(FEED));
    vi.stubGlobal("fetch", fetchMock);
    const videos = await fetchYoutubeVideos("UC123");
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://www.youtube.com/feeds/videos.xml?channel_id=UC123",
    );
    expect(videos.map((v) => v.youtubeId)).toEqual(["ZxkUzuG64zE", "abcDEF12345"]);
  });

  it("falls back to no videos when YouTube errors or is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 404 })));
    expect(await fetchYoutubeVideos("UC123")).toEqual([]);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect(await fetchYoutubeVideos("UC123")).toEqual([]);
  });
});
