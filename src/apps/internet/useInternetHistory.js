import { useEffect, useRef, useState } from 'react';
import { normalizeUrl } from './normalizeUrl';

/**
 * A blocked embed (CSP / X-Frame-Options) is, by design, something the
 * parent page usually cannot observe directly — the browser just never
 * finishes "loading" the blocked content, and `iframe.onerror` is not a
 * reliable signal for this (it's meant for network-level failures, and
 * plenty of browsers never fire it for a security-policy refusal either).
 * So this is a heuristic, not a guarantee: if nothing has reported success
 * within LOAD_TIMEOUT_MS, we treat it as failed. This can occasionally be
 * wrong in both directions (a slow-but-working site could time out; a
 * blocked site that still fires `load` for an empty frame could look like
 * it "succeeded") — there's no way to fully close that gap without
 * bypassing browser security, which this app deliberately does not do.
 */
const LOAD_TIMEOUT_MS = 8000;

/**
 * In-memory navigation history for a single Internet app instance.
 *
 * Deliberately mirrors ExplorerApp's local-hook pattern (see
 * apps/explorer/hooks/useExplorerNav.js) rather than reaching for a global
 * store: this state only ever matters to one running Internet window and
 * is never persisted.
 *
 * history / historyIndex behave like a standard browser stack:
 *   - navigate(url) truncates any "forward" entries past the current index
 *     before pushing the new entry (A → B → C, back to B, navigate to D
 *     discards C).
 *   - navigating to the same URL that's already current doesn't create a
 *     duplicate history entry, but does retry the load in place (like
 *     Reload) — useful for clicking Go again after a failed load.
 *   - reload() never touches history, it just bumps a remount key.
 *   - goHome() resets to the initial "no page loaded" state.
 */
export function useInternetHistory() {
  const [history, setHistory] = useState([]); // array of normalized URLs
  const [historyIndex, setHistoryIndex] = useState(-1); // -1 === home/initial state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const timeoutRef = useRef(null);

  const currentUrl = historyIndex >= 0 ? history[historyIndex] : null;
  const canGoBack = historyIndex > 0;

  const clearLoadTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // (Re)arm the failure-detection timeout every time the page we're
  // pointed at actually changes (new URL, reload, or the same URL
  // resubmitted) — never on unrelated re-renders.
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

    setHistory((prev) => [...prev.slice(0, historyIndex + 1), normalized]);
    setHistoryIndex((prev) => prev + 1);
    setError(false);
    setLoading(true);
    return normalized;
  };

  const goBack = () => {
    if (!canGoBack) return;
    setError(false);
    setHistoryIndex((prev) => prev - 1);
    setLoading(true);
  };

  /** Reloads the current page in place — no history change. Also used as "Retry" from the error state, since retrying is just reloading the same address. */
  const reload = () => {
    if (!currentUrl) return;
    setError(false);
    setLoading(true);
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
    canGoBack,
    loading,
    error,
    reloadKey,
    navigate,
    goBack,
    reload,
    goHome,
    handleLoaded,
    handleLoadError,
  };
}
