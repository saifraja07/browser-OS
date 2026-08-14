import { useEffect, useRef, useState } from 'react';
import { searchInternet } from './internetSearchService';

/**
 * Fetches search results for the Internet app's currently active search
 * entry. Phase 5: this is now a pure data-fetching hook with no
 * navigational memory of its own — "which query is active" and "did the
 * user just hit Reload" both come from useInternetHistory's single,
 * unified history stack (`currentSearchQuery`, `reloadKey`), so there is
 * only ever one history system, not two.
 *
 * Mirrors useInternetHistory's own load-timeout effect in shape: an
 * effect keyed on the values that should trigger a (re)fetch, cleaning up
 * any in-flight request first.
 *
 * @param {string|null} query - the active search query, or null when not
 *   currently viewing search results (e.g. a URL or the home state).
 * @param {number} reloadKey - bumped by useInternetHistory's reload();
 *   changing it re-runs the fetch for the same query without touching
 *   history, so Reload repeats the current search with no duplicate entry.
 */
export function useInternetSearch(query, reloadKey) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current?.abort();

    if (!query) {
      // Not currently viewing search results — nothing to fetch, and
      // stale results/errors from a previous query shouldn't linger.
      setResults([]);
      setLoading(false);
      setErrorMessage(null);
      return undefined;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setResults([]);
    setErrorMessage(null);
    setLoading(true);

    searchInternet(query, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setResults(data?.results ?? []);
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
