/**
 * In-memory cache for Internet-app search results, keyed by normalized
 * query text. Deliberately separate from useInternetHistory: this module
 * owns caching only (get/set/has/clear + TTL expiry) and knows nothing
 * about navigation, history entries, or React state.
 *
 * Module-scoped `cache` map means results survive as long as the page is
 * open — including across the Internet app window being closed/reopened
 * or the underlying hook remounting — and are simply garbage collected
 * on a full page reload. No localStorage/IndexedDB/backend involved, per
 * the "in-memory is sufficient for this feature" requirement.
 */

const TTL_MS = 7 * 60 * 1000; // 7 minutes — within the requested 5–10 min window

const cache = new Map(); // normalizedQuery -> { results, timestamp }

/** "React", " react ", "REACT" all resolve to the same cache entry. */
function normalizeQuery(query) {
  return typeof query === 'string' ? query.trim().toLowerCase() : '';
}

/**
 * Returns the cached results for `query` if a non-expired entry exists,
 * otherwise null. Expired entries are evicted as a side effect of the
 * lookup so the map doesn't accumulate stale data.
 */
export function getCachedResults(query) {
  const key = normalizeQuery(query);
  if (!key) return null;

  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.results;
}

/** True if a valid (present + unexpired) cache entry exists for `query`. */
export function hasValidCache(query) {
  return getCachedResults(query) !== null;
}

/** Stores/replaces the cached results for `query`, stamped with now(). */
export function setCachedResults(query, results) {
  const key = normalizeQuery(query);
  if (!key) return;
  cache.set(key, { results: results ?? [], timestamp: Date.now() });
}

/** Discards a single query's cached entry, if any (e.g. on hard reload). */
export function invalidateCachedResults(query) {
  const key = normalizeQuery(query);
  if (!key) return;
  cache.delete(key);
}

/** Drops all cached search results. Exposed for completeness/tests. */
export function clearSearchCache() {
  cache.clear();
}
