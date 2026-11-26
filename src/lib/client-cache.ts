interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(
  key: string,
  maxAgeMs = 60000
): { data: T; isStale: boolean } | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  return {
    data: entry.data as T,
    isStale: age > maxAgeMs,
  };
}

export function setCached<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}

export function invalidateCachePrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
