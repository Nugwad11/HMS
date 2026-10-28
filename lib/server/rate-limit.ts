const buckets = new Map<string, number[]>();
const MAX_KEYS = 5000;

/**
 * Fixed-window throttle held in process memory. It is a speed bump for a single
 * demo server, not a substitute for a shared limiter once there are replicas.
 */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const hits = (buckets.get(key) ?? []).filter((at) => now - at < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }

  hits.push(now);
  buckets.set(key, hits);

  if (buckets.size > MAX_KEYS) {
    for (const [candidate, timestamps] of buckets) {
      const last = timestamps[timestamps.length - 1];
      if (!last || now - last >= windowMs) buckets.delete(candidate);
    }
  }

  return true;
}
