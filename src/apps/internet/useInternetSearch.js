import { useEffect, useRef, useState } from 'react';
import { searchInternet } from './internetSearchService';
import { searchWikipedia } from './wikipediaService';
import { getCachedSearchState, setCachedSearchState } from './internetSearchCache';

const NOT_FOUND = { found: false };

/**
 * Fetches search results (and a Wikipedia Quick Answer) for the Internet
 * app's currently active search entry. Phase 5: this is a pure
 * data-fetching hook with no navigational memory of its own — "which
 * query is active" and "did the user just hit Reload" both come from
 * useInternetHistory's single, unified history stack (`currentSearchQuery`,
 * `reloadKey`), so there is only ever one history system, not two.
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
  const [quickAnswer, setQuickAnswer] = useState(null);
  const [quickAnswerLoading, setQuickAnswerLoading] = useState(false);

  const abortRef = useRef(null);
  const wikiAbortRef = useRef(null);
  const lastQueryRef = useRef(null);

  useEffect(() => {
    abortRef.current?.abort();
    wikiAbortRef.current?.abort();

    if (!query) {
      // Not currently viewing search results — nothing to fetch, and
      // stale results/errors from a previous query shouldn't linger.
      lastQueryRef.current = null;
      setResults([]);
      setLoading(false);
      setErrorMessage(null);
      setQuickAnswer(null);
      setQuickAnswerLoading(false);
      return undefined;
    }

    // Same query as last render, but the effect re-ran anyway => it was
    // reloadKey that changed, i.e. an explicit Reload/resubmit. That's
    // the one case that must bypass the cache.
    const isExplicitResubmit = lastQueryRef.current === query;
    lastQueryRef.current = query;

    if (!isExplicitResubmit) {
      const cached = getCachedSearchState(query);
      if (cached) {
        // Cache hit: restore both results and Quick Answer instantly —
        // no loading state, no requests. This is what makes Back/Forward
        // feel instant.
        setResults(cached.results);
        setQuickAnswer(cached.quickAnswer);
        setErrorMessage(null);
        setLoading(false);
        setQuickAnswerLoading(false);
        return undefined;
      }
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const wikiController = new AbortController();
    wikiAbortRef.current = wikiController;

    setResults([]);
    setErrorMessage(null);
    setLoading(true);
    setQuickAnswer(null);
    setQuickAnswerLoading(true);

    // Tracks the latest settled value of each independent request for
    // this effect run, so whichever resolves second can write the
    // *combined* cache entry without waiting on the other on purpose.
    let latestResults = null;
    let latestQuickAnswer = null;

    const maybeCacheCombined = () => {
      // Only cache once web results have actually succeeded — an
      // errored search shouldn't get cached as if it were valid.
      if (latestResults !== null) {
        setCachedSearchState(query, {
          results: latestResults,
          quickAnswer: latestQuickAnswer ?? NOT_FOUND,
        });
      }
    };

    searchInternet(query, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        const freshResults = data?.results ?? [];
        setResults(freshResults);
        latestResults = freshResults;
        maybeCacheCombined();
      })
      .catch((err) => {
        if (err?.name === 'AbortError' || controller.signal.aborted) return;
        setErrorMessage(err?.message || 'Search failed. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // Runs in parallel with searchInternet above, not chained after it.
    // Wikipedia is an enhancement: any failure resolves to "not found"
    // rather than surfacing an error, so it can never break search.
    searchWikipedia(query, { signal: wikiController.signal })
      .then((answer) => {
        if (wikiController.signal.aborted) return;
        const normalized = answer?.found ? answer : NOT_FOUND;
        setQuickAnswer(normalized);
        latestQuickAnswer = normalized;
        maybeCacheCombined();
      })
      .catch(() => {
        if (wikiController.signal.aborted) return;
        setQuickAnswer(NOT_FOUND);
        latestQuickAnswer = NOT_FOUND;
        maybeCacheCombined();
      })
      .finally(() => {
        if (!wikiController.signal.aborted) setQuickAnswerLoading(false);
      });

    return () => {
      controller.abort();
      wikiController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, reloadKey]);

  return { results, loading, errorMessage, quickAnswer, quickAnswerLoading };
}
