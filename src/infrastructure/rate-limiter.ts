const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS = 5;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function createMemoryRateLimiter(options?: {
  windowMs?: number;
  maxHits?: number;
  now?: () => number;
}) {
  const windowMs = options?.windowMs ?? WINDOW_MS;
  const maxHits = options?.maxHits ?? MAX_HITS;
  const now = options?.now ?? Date.now;
  const store = options ? new Map<string, Bucket>() : buckets;

  return {
    async consume(key: string) {
      const t = now();
      const current = store.get(key);
      if (!current || current.resetAt <= t) {
        store.set(key, { count: 1, resetAt: t + windowMs });
        return { ok: true as const };
      }
      if (current.count >= maxHits) {
        return {
          ok: false as const,
          retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - t) / 1000)),
        };
      }
      current.count += 1;
      return { ok: true as const };
    },
  };
}
