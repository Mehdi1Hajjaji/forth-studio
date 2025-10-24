type Key = string;

const buckets: Map<Key, { tokens: number; updatedAt: number }> = new Map();

/**
 * Very small in-memory token bucket limiter.
 * Not production-grade for serverless, but good enough for MVP/dev.
 */
export function rateLimit(key: string, opts: { rate: number; perMs: number; burst?: number }) {
  const now = Date.now();
  const burst = Math.max(opts.burst ?? opts.rate, 1);
  const refillPerToken = opts.perMs / opts.rate;
  const bucket = buckets.get(key) ?? { tokens: burst, updatedAt: now };
  const elapsed = now - bucket.updatedAt;
  const refill = Math.floor(elapsed / refillPerToken);
  bucket.tokens = Math.min(burst, bucket.tokens + refill);
  bucket.updatedAt = now;
  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}

export function getClientKey(headers: Headers) {
  return headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown';
}

