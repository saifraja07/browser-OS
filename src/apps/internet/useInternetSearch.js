import { useEffect, useRef, useState } from 'react';
import { searchInternet } from './internetSearchService';
import { getCachedResults, setCachedResults } from './internetSearchCache';

/**
 * Fetches search results for the Internet app's currently active search
 * entry. Phase 5: this is now a pure data-fetching hook with no
 * navigational memory of its own — "which query is active" and "did the
 * user just hit Reload" both come from useInternetHistory's single,
 * unified history stack (`currentSearchQuery`, `reloadKey`), so there is
 * only ever one history system, not two.
 *
 * `lastQueryRef` is what distinguishes those two cases; it's compared
 * against the incoming `query` inside the effect, before being updated to
 * it. This mirrors useInternetHistory's own load-timeout effect in shape:
 * an effect keyed on the values that should trigger a (re)fetch, cleaning
 * up any in-flight request first.
 *
 * @param {string|null} query - the active search query, or null when not
 *   currently viewing search results (e.g. a URL or the home state).
 * @param {number} reloadKey - bumped by useInternetHistory's reload() (and
 *   by resubmitting the query already showing); changing it while `query`
 *   is unchanged means "fetch fresh, ignore cache".
 */
export function useInternetSearch(query, reloadKey) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const abortRef = useRef(null);
  const lastQueryRef = useRef(null);

  useEffect(() => {
    abortRef.current?.abort();

    if (!query) {
      // Not currently viewing search results — nothing to fetch, and
      // stale results/errors from a previous query shouldn't linger.
      lastQueryRef.current = null;
      setResults([]);
      setLoading(false);
      setErrorMessage(null);
      return undefined;
    }

    const isExplicitResubmit = lastQueryRef.current === query;
    lastQueryRef.current = query;

    if (!isExplicitResubmit) {
      const cached = getCachedResults(query);
      if (cached) {
        // Cache hit: restore instantly, no loading state, no request —
        // this is what makes Back/Forward feel instant.
        setResults(cached);
        setErrorMessage(null);
        setLoading(false);
        return undefined;
      }
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setResults([]);
    setErrorMessage(null);
    setLoading(true);

    searchInternet(query, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        const freshResults = data?.results ?? [];
        setResults(freshResults);
        // Cache fresh results (or replace a stale/expired entry) so a
        // future Back/Forward to this exact query is instant too.
        setCachedResults(query, freshResults);
      })
      .catch((err) => {
        if (err?.name === 'AbortError' || controller.signal.aborted) return;
        setErrorMessage(err?.message || 'Search failed. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, reloadKey]);

  return { results, loading, errorMessage };
}
