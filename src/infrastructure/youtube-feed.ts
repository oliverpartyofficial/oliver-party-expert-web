export interface YoutubeVideo {
  youtubeId: string;
  title: string;
}

const FEED_URL = "https://www.youtube.com/feeds/videos.xml?playlist_id=";
const REVALIDATE_SECONDS = 3600;

/**
 * YouTube keeps an auto-generated "Shorts" playlist per channel whose id is
 * the channel id with "UC" swapped for "UUSH". Undocumented but long-stable;
 * reading it means landscape videos (which would letterbox in the 9:16
 * gallery) never get in.
 */
export function shortsPlaylistId(channelId: string): string | null {
  return /^UC[\w-]{22}$/.test(channelId) ? "UUSH" + channelId.slice(2) : null;
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decodeXml(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&(amp|lt|gt|quot|apos|#39);/g, (entity) => ENTITIES[entity]);
}

/** Parses a YouTube Atom feed (a playlist feed returns its latest 15 entries). */
export function parseYoutubeFeed(xml: string): YoutubeVideo[] {
  const videos: YoutubeVideo[] = [];
  for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]?.trim();
    const title = entry.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    if (id) videos.push({ youtubeId: id, title: decodeXml(title).trim() });
  }
  return videos;
}

/**
 * Latest shorts for the gallery. Cached by Next for an hour, so the page
 * regenerates at most hourly instead of calling YouTube per visit. Any
 * failure returns [] — the gallery falls back to the static catalog.
 */
export async function fetchYoutubeShorts(channelId: string): Promise<YoutubeVideo[]> {
  const playlistId = shortsPlaylistId(channelId);
  if (!playlistId) return [];
  try {
    const response = await fetch(FEED_URL + playlistId, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return [];
    return parseYoutubeFeed(await response.text());
  } catch {
    return [];
  }
}
