export interface YoutubeVideo {
  youtubeId: string;
  title: string;
}

const FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=";
const REVALIDATE_SECONDS = 3600;

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

/** Parses YouTube's public channel Atom feed (latest 15 uploads, shorts included). */
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
 * Latest uploads for the gallery. Cached by Next for an hour, so the page
 * regenerates at most hourly instead of calling YouTube per visit. Any
 * failure returns [] — the gallery falls back to the static catalog.
 */
export async function fetchYoutubeVideos(channelId: string): Promise<YoutubeVideo[]> {
  if (!channelId) return [];
  try {
    const response = await fetch(FEED_URL + encodeURIComponent(channelId), {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return [];
    return parseYoutubeFeed(await response.text());
  } catch {
    return [];
  }
}
