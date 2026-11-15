const store = globalThis.__tiuRateLimitStore || new Map();
if (!globalThis.__tiuRateLimitStore) {
  globalThis.__tiuRateLimitStore = store;
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * In-memory sliding-window rate limiter.
 * Returns { allowed: boolean, remaining: number, retryAfterSec: number }.
 */
export function checkRateLimit(key, limit = 15, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const timestamps = (store.get(key) || []).filter((ts) => now - ts < windowMs);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    store.set(key, timestamps);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { allowed: true, remaining: limit - timestamps.length, retryAfterSec: 0 };
}
