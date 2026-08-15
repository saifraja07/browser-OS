/**
 * In-memory cache for Internet-app search state, keyed by normalized
 * query text. Deliberately separate from useInternetHistory: this module
 * owns caching only (get/set/has/clear + TTL expiry) and knows nothing
 * about navigation, history entries, or React state.
 *
 * Module-scoped `cache` map means results survive as long as the page is
 * open — including across the Internet app window being closed/reopened
 * or the underlying hook remounting — and are simply garbage collected
 * on a full page reload. No localStorage/IndexedDB/backend involved, per
 * the "in-memory is sufficient for this feature" requirement.
 *
 * Phase 7 (Wikipedia Quick Answer): a cache entry now holds the full
 * search state for a query — the web results AND the Quick Answer — as
 * one unit, so restoring from cache (e.g. via Back/Forward) brings both
 * back together with a single lookup and zero network requests. This is
 * the same Map/TTL/normalizeQuery mechanism as before; only the payload
 * shape grew from a bare results array to { results, quickAnswer }.
 */

const TTL_MS = 7 * 60 * 1000; // 7 minutes — within the requested 5–10 min window

const cache = new Map(); // normalizedQuery -> { results, quickAnswer, timestamp }

/** "React", " react ", "REACT" all resolve to the same cache entry. */
function normalizeQuery(query) {
  return typeof query === 'string' ? query.trim().toLowerCase() : '';
}

/**
 * Returns the cached { results, quickAnswer } for `query` if a
 * non-expired entry exists, otherwise null. Expired entries are evicted
 * as a side effect of the lookup so the map doesn't accumulate stale
 * data.
 */
export function getCachedSearchState(query) {
  const key = normalizeQuery(query);
  if (!key) return null;

  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(key);
    return null;
  }

  return { results: entry.results, quickAnswer: entry.quickAnswer };
}

/** True if a valid (present + unexpired) cache entry exists for `query`. */
export function hasValidCache(query) {
  return getCachedSearchState(query) !== null;
}

/**
 * Stores/replaces the cached state for `query`, stamped with now().
 * `quickAnswer` defaults to `{ found: false }` so callers that only have
 * web results yet (Wikipedia still in flight, or it failed) can still
 * cache what they have — see useInternetSearch, which calls this again
 * once the Quick Answer settles, replacing the entry with the complete
 * picture.
 */
export function setCachedSearchState(query, { results, quickAnswer } = {}) {
  const key = normalizeQuery(query);
  if (!key) return;
  cache.set(key, {
    results: results ?? [],
    quickAnswer: quickAnswer ?? { found: false },
    timestamp: Date.now(),
  });
}

/** Discards a single query's cached entry, if any (e.g. on hard reload). */
export function invalidateCachedResults(query) {
  const key = normalizeQuery(query);
  if (!key) return;
  cache.delete(key);
}

/** Drops all cached search state. Exposed for completeness/tests. */
export function clearSearchCache() {
  cache.clear();
}
