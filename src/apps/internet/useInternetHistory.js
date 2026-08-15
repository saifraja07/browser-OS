import { useEffect, useRef, useState } from 'react';
import { normalizeUrl } from './normalizeUrl';

const LOAD_TIMEOUT_MS = 8000;

/**
 * In-memory navigation history for a single Internet app instance.
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
  // The "no page loaded" Home state (historyIndex === -1) is itself a
  // valid, reachable point in the stack — you can Back into it from the
  // first entry, and Forward out of it back to that entry. So Back is
  // available for ANY current entry (search or url), not just once a
  // second entry exists; Forward is available whenever there's a later
  // entry, including from Home itself.
  const canGoBack = historyIndex >= 0;
  const canGoForward = historyIndex < history.length - 1;

  // Most-recently-visited PAGE entries for the home screen's "Recently
  // viewed" list (newest first, deduped by url, current entry excluded).
  // Search entries are deliberately skipped — the home screen already
  // has a fixed "Trending Searches" list, so past search queries aren't
  // tracked/surfaced separately. Derived straight from the same history
  // stack everything else here uses — no separate tracking.
  const recentEntries = [];
  {
    const seen = new Set();
    for (let i = history.length - 1; i >= 0; i -= 1) {
      const entry = history[i];
      if (entry.type !== 'url') continue;
      if (entry === currentEntry || seen.has(entry.value)) continue;
      seen.add(entry.value);
      recentEntries.push(entry);
      if (recentEntries.length >= 5) break;
    }
  }

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
    const targetIndex = historyIndex - 1; // may become -1 (Home)
    const targetEntry = targetIndex >= 0 ? history[targetIndex] : null;
    setError(false);
    // Only the iframe (URL entries) uses this loading flag; a search
    // entry's loading state comes from useInternetSearch instead, and
    // going back to one that was already fetched shows its cached
    // results immediately rather than re-searching. Landing back on
    // Home (targetEntry === null) needs no loading state either.
    setLoading(targetEntry?.type === 'url');
    setHistoryIndex(targetIndex);
  };

  /**
   * Mirror image of goBack(): moves the index forward one entry without
   * touching the history array itself. Reachable both from a normal
   * entry (there's a later one) and from Home (historyIndex === -1),
   * since Home is itself a valid point you can Back into and Forward
   * back out of. Only reachable when canGoForward is true (i.e. the
   * user came here via goBack and hasn't since made a new navigation,
   * which would have truncated anything ahead of it).
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
    recentEntries,
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