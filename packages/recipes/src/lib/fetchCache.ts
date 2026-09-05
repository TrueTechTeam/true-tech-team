// A small in-memory GET cache/dedup layer — no new dependency, just a module-
// level Map. Solves two distinct problems for client-side data fetching:
//
// 1. Concurrent dedup: if the same URL is requested again while a request to
//    it is already in flight, the second caller gets the SAME promise
//    instead of firing a second network request. This is what collapses
//    React StrictMode's dev-only double-effect-invoke (and any other
//    near-simultaneous duplicate calls) into one real request.
// 2. Short-TTL cache: once resolved, the response stays cached for `ttlMs`
//    so a burst of re-renders requesting the same URL don't each refetch.
//
// This does NOT replace a real data-fetching library (SWR/React Query) —
// there's no revalidation-on-focus, no retry policy, no built-in React
// integration. It's the minimum needed to stop duplicate calls without
// adding a dependency. Callers that mutate the underlying data MUST call
// `invalidateCachedGet`/`invalidateCachedGetPrefix` afterward, or a
// refetch within the TTL window will silently serve stale data.

interface CacheEntry<T> {
  expiresAt: number;
  promise: Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();

export interface CachedGetOptions {
  // How long a resolved response stays servable from cache. Keep this short
  // (default 2s) — it's meant to absorb accidental duplicate calls within
  // the same interaction, not to act as a real data cache.
  ttlMs?: number;
}

export function cachedGetJSON<T>(url: string, options: CachedGetOptions = {}): Promise<T> {
  const ttlMs = options.ttlMs ?? 2000;
  const now = Date.now();

  const existing = cache.get(url);
  if (existing && existing.expiresAt > now) {
    return existing.promise as Promise<T>;
  }

  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      return res.json() as Promise<T>;
    })
    .catch((err: unknown) => {
      cache.delete(url); // never cache a failure
      throw err;
    });

  cache.set(url, { expiresAt: now + ttlMs, promise });
  return promise;
}

export function invalidateCachedGet(url: string): void {
  cache.delete(url);
}

// Clears every cached URL starting with `prefix` — use this when a mutation
// affects a whole collection endpoint regardless of its query string (e.g.
// invalidate every `/api/recipes/saved?...` variant after saving one).
export function invalidateCachedGetPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
