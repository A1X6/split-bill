import "server-only";

/**
 * Best-effort in-memory rate limit. Serverless instances don't share memory, so
 * this raises the cost of abuse (e.g. user-search enumeration) without truly
 * capping it. A DB- or Redis-backed counter would be the real fix; this is a
 * deliberately cheap deterrent.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) {
    return false;
  }
  bucket.count += 1;
  return true;
}
