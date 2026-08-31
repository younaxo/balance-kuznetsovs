import "server-only";

/**
 * Простой in-memory sliding-window rate limiter.
 *
 * Осознанное архитектурное ограничение: состояние живёт в памяти одного
 * процесса. Для однонодового Docker/VPS-развёртывания (см. README,
 * раздел Deployment) этого достаточно и не требует Redis. При переходе
 * на несколько инстансов лимитер нужно будет вынести во внешнее
 * хранилище — интерфейс `checkRateLimit` для этого не придётся менять
 * на вызывающей стороне.
 */

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

// Периодическая очистка, чтобы Map не росла бесконечно на долгоживущем процессе.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupIfNeeded(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (
      bucket.timestamps.length === 0 ||
      now - bucket.timestamps[bucket.timestamps.length - 1] > CLEANUP_INTERVAL_MS
    ) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  cleanupIfNeeded(now);

  const bucket = buckets.get(key) ?? { timestamps: [] };
  const windowStart = now - options.windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= options.limit) {
    buckets.set(key, bucket);
    const oldest = bucket.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, oldest + options.windowMs - now),
    };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return {
    allowed: true,
    remaining: options.limit - bucket.timestamps.length,
    retryAfterMs: 0,
  };
}

/** Только для тестов: сбрасывает состояние лимитера. */
export function __resetRateLimiterForTests() {
  buckets.clear();
}
