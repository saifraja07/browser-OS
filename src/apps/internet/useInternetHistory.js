import { useEffect, useRef, useState } from 'react';
import { normalizeUrl } from './normalizeUrl';

const LOAD_TIMEOUT_MS = 8000;

/**
 * In-memory navigation history for a single Internet app instance.
 *
 * Deliberately mirrors ExplorerApp's local-hook pattern (see
 * apps/explorer/hooks/useExplorerNav.js) rather than reaching for a global
 * store: this state only ever matters to one running Internet window and
 * is never persisted.
 *
 * A single stack (`history` / `historyIndex`) covers BOTH URL visits and
 * search-results views — there is deliberately no second, parallel
 * history for search (Phase 5). Each entry is either:
 *   { type: 'url',    value: <normalized URL> }
 *   { type: 'search', value: <trimmed query> }
 *
 * history / historyIndex otherwise behave like a standard browser stack:
 *   - goBack()/goForward() only move historyIndex; they never mutate the
 *     history array, so alternating Back/Forward never creates duplicate
 *     or dropped entries.
 *   - navigate(url) / navigateToSearch(query) both truncate any "forward"
 *     entries past the current index before pushing the new entry
 *     (A → B → C, back to B, navigate to D discards C) — regardless of
 *     whether the entries being truncated/pushed are URLs or searches.
 *   - re-submitting the same URL/query that's already current doesn't
 *     create a duplicate history entry, but does retry in place (like
 *     Reload) — useful for clicking Go again after a failed load, or
 *     hitting Enter again on the same search.
 *   - reload() never touches history, it just bumps a remount key that
 *     both the iframe (for URL entries) and useInternetSearch (for search
 *     entries, which re-fetches when it changes) key off of.
 *   - goHome() resets to the initial "no page loaded" state, which also
 *     naturally exits search — there's nothing search-specific to reset.
 *
 * `loading` / `error` are meaningful only for URL entries — they track
 * the iframe's best-effort load-timeout heuristic (see LOAD_TIMEOUT_MS
 * below) and are left alone by search navigation. Search's own
 * loading/error state is owned entirely by useInternetSearch, driven by
 * `currentSearchQuery` + `reloadKey` from this hook.
 */
export function useInternetHistory() {
  const [history, setHistory] = useState([]); // array of { type: 'url' | 'search', value }
  const [historyIndex, setHistoryIndex] = useState(-1); // -1 === home/initial state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const timeoutRef = useRef(null);

  const currentEntry = historyIndex >= 0 ? history[historyIndex] : null;
  const currentUrl = currentEntry?.type === 'url' ? currentEntry.value : null;
  const currentSearchQuery = currentEntry?.type === 'search' ? currentEntry.value : null;
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex >= 0 && historyIndex < history.length - 1;

  const clearLoadTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // (Re)arm the failure-detection timeout every time the page we're
  // pointed at actually changes (new URL, reload, or the same URL
  // resubmitted) — never on unrelated re-renders. This is a no-op while
  // on a search entry, since currentUrl is null there.
  useEffect(() => {
    clearLoadTimeout();
    if (!currentUrl) return undefined;

    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setError(true);
    }, LOAD_TIMEOUT_MS);

    return clearLoadTimeout;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl, reloadKey]);

  /** Normalizes and navigates to a new address. Returns the normalized URL, or null if the input was empty/invalid (nothing happened). */
  const navigate = (rawInput) => {
    const normalized = normalizeUrl(rawInput);
    if (!normalized) return null;

    // Setting the same URL that's already current shouldn't create a
    // duplicate history entry — but it SHOULD still retry the load (e.g.
    // clicking Go again on a page that failed/timed out), the same way
    // Reload does.
    if (normalized === currentUrl) {
      setError(false);
      setLoading(true);
      setReloadKey((k) => k + 1);
      return normalized;
    }

    setHistory((prev) => [
      ...prev.slice(0, historyIndex + 1),
      { type: 'url', value: normalized },
    ]);
    setHistoryIndex((prev) => prev + 1);
    setError(false);
    setLoading(true);
    return normalized;
  };

  /** Trims and navigates to a search-results state for the given query. Returns the trimmed query, or null if it was empty (nothing happened). */
  const navigateToSearch = (rawQuery) => {
    const trimmed = typeof rawQuery === 'string' ? rawQuery.trim() : '';
    if (!trimmed) return null;

    // Same as navigate(): resubmitting the query already being viewed
    // retries in place instead of pushing a duplicate entry.
    if (trimmed === currentSearchQuery) {
      setReloadKey((k) => k + 1);
      return trimmed;
    }

    setHistory((prev) => [
      ...prev.slice(0, historyIndex + 1),
      { type: 'search', value: trimmed },
    ]);
    setHistoryIndex((prev) => prev + 1);
    setError(false);
    return trimmed;
  };

  const goBack = () => {
    if (!canGoBack) return;
    const targetIndex = historyIndex - 1;
    const targetEntry = history[targetIndex];
    setError(false);
    // Only the iframe (URL entries) uses this loading flag; a search
    // entry's loading state comes from useInternetSearch instead, and
    // going back to one that was already fetched shows its cached
    // results immediately rather than re-searching.
    setLoading(targetEntry?.type === 'url');
    setHistoryIndex(targetIndex);
  };

  /**
   * Mirror image of goBack(): moves the index forward one entry without
   * touching the history array itself. Only reachable when canGoForward
   * is true (i.e. the user came here via goBack and hasn't since made a
   * new navigation, which would have truncated anything ahead of it).
   */
  const goForward = () => {
    if (!canGoForward) return;
    const targetIndex = historyIndex + 1;
    const targetEntry = history[targetIndex];
    setError(false);
    setLoading(targetEntry?.type === 'url');
    setHistoryIndex(targetIndex);
  };

  /**
   * Reloads the current entry in place — no history change. For a URL
   * entry this remounts the iframe (existing behavior). For a search
   * entry, useInternetSearch re-fetches because it watches this same
   * reloadKey. Also used as "Retry" from both InternetErrorState and
   * InternetSearchError, since retrying is just reloading the current
   * entry.
   */
  const reload = () => {
    if (!currentUrl && !currentSearchQuery) return;
    if (currentUrl) {
      setError(false);
      setLoading(true);
    }
    setReloadKey((k) => k + 1);
  };

  /** Back to the Internet app's initial "no page loaded" state. */
  const goHome = () => {
    setHistory([]);
    setHistoryIndex(-1);
    setLoading(false);
    setError(false);
  };

  const handleLoaded = () => {
    clearLoadTimeout();
    setLoading(false);
  };

  // Rarely fired for CSP/X-Frame-Options refusals, but cheap to also
  // listen for — some browsers do surface a genuine network-level error
  // this way, and the timeout above still catches everything else.
  const handleLoadError = () => {
    clearLoadTimeout();
    setLoading(false);
    setError(true);
  };

  return {
    currentUrl,
    currentSearchQuery,
    canGoBack,
    canGoForward,
    loading,
    error,
    reloadKey,
    navigate,
    navigateToSearch,
    goBack,
    goForward,
    reload,
    goHome,
    handleLoaded,
    handleLoadError,
  };
}
