import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  RotateCw,
  Home,
  ArrowRight,
  Globe,
  Bookmark,
  Clock,
  History,
} from "lucide-react";
import { useInternetHistory } from "./useInternetHistory";
import { useInternetSearch } from "./useInternetSearch";
import { isLikelyUrl } from "./normalizeUrl";
import InternetErrorState from "./components/InternetErrorState";
import InternetSearchResults from "./components/InternetSearchResults";

const bookmarks = [
  "https://mirhaadi.in",
  "https://berojgaryuva.vercel.app",
  "https://browser-os-one.vercel.app",
];

// Fixed set of trending searches shown on the Internet app's home
// screen — plain search text only (never URLs), always the same list.
const trendingSearches = [
  "India got latent",
  "Latest AI news",
  "Weather today",
  "how to center a div?",
  "Cricket scores",
];

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function faviconSrc(domain) {
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(domain)}`;
}

/** A single Bookmarks/Recently-viewed row: an icon slot + label, boxed like a search-result card. */
function HomeLinkRow({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex w-full items-center gap-2.5 rounded-[14px] border-2 border-os-border-strong bg-os-surface-2 px-2.5 py-2 text-left transition-transform hover:-translate-y-0.5 hover:border-os-accent hover:bg-os-surface active:translate-y-0"
    >
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded border border-os-border bg-os-surface"
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-os-ink">
        {label}
      </span>
    </button>
  );
}

/** A single Trending Searches row: plain, unboxed — just a history-style icon + label with a hover highlight, not a bordered card like Bookmarks. */
function TrendingSearchRow({ query, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(query)}
      title={query}
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-os-surface-2 active:bg-os-surface-2"
    >
      <History
        size={13}
        className="shrink-0 text-os-ink-soft"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-os-ink">
        {query}
      </span>
    </button>
  );
}

/** HomeLinkRow for a page URL (bookmarks, and 'url'-type recent entries): favicon + hostname. */
function HomeUrlRow({ url, onClick }) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const domain = hostnameOf(url);
  const icon = faviconSrc(domain);
  const showFavicon = icon && !faviconFailed;

  return (
    <HomeLinkRow
      label={domain}
      onClick={() => onClick(url)}
      icon={
        showFavicon ? (
          <img
            src={icon}
            alt=""
            width={16}
            height={16}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFaviconFailed(true)}
            className="h-4 w-4"
          />
        ) : (
          <Globe size={12} className="text-os-ink-soft" />
        )
      }
    />
  );
}

export default function InternetApp() {
  const [inputUrl, setInputUrl] = useState("");
  const inputRef = useRef(null);

  const {
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
  } = useInternetHistory();

  const {
    results: searchResults,
    loading: searchLoading,
    errorMessage: searchErrorMessage,
    quickAnswer,
    quickAnswerLoading,
  } = useInternetSearch(currentSearchQuery, reloadKey);

  // The address bar always mirrors whatever the current history entry
  // is — a page URL or a search query — and clears at the home state.
  useEffect(() => {
    setInputUrl(currentUrl ?? currentSearchQuery ?? "");
  }, [currentUrl, currentSearchQuery]);

  const goTo = (rawInput) => {
    const normalized = navigate(rawInput);

    if (!normalized) {
      inputRef.current?.focus();
    }
  };

  /** Address-bar submission (Enter or Go): URLs navigate as before, anything else becomes a search history entry. */
  const handleSubmit = (rawInput) => {
    const trimmed = typeof rawInput === "string" ? rawInput.trim() : "";
    if (!trimmed) return;

    if (isLikelyUrl(trimmed)) {
      goTo(trimmed);
      return;
    }

    if (!navigateToSearch(trimmed)) {
      inputRef.current?.focus();
    }
  };

  const handleGoClick = () => handleSubmit(inputUrl);

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(inputUrl);
    }
  };

  const handleRecentSiteClick = (url) => {
    setInputUrl(url);
    goTo(url);
  };

  const handleRecentSearchClick = (query) => {
    setInputUrl(query);
    navigateToSearch(query);
  };

  const handleSearchResultClick = (url) => {
    setInputUrl(url);
    goTo(url);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b-2 border-os-border px-2 py-1.5">
        <button
          type="button"
          onClick={goBack}
          disabled={!canGoBack}
          className="rounded p-1 text-os-ink-soft enabled:hover:bg-os-surface-2 enabled:hover:text-os-ink disabled:opacity-30"
          aria-label="Back"
        >
          <ArrowLeft size={15} />
        </button>

        <button
          type="button"
          onClick={goForward}
          disabled={!canGoForward}
          className="rounded p-1 text-os-ink-soft enabled:hover:bg-os-surface-2 enabled:hover:text-os-ink disabled:opacity-30"
          aria-label="Forward"
        >
          <ArrowRight size={15} />
        </button>

        <button
          type="button"
          onClick={reload}
          disabled={!currentUrl && !currentSearchQuery}
          className="rounded p-1 text-os-ink-soft enabled:hover:bg-os-surface-2 enabled:hover:text-os-ink disabled:opacity-30"
          aria-label="Reload"
        >
          <RotateCw size={15} />
        </button>

        <button
          type="button"
          onClick={goHome}
          className="rounded p-1 text-os-ink-soft hover:bg-os-surface-2 hover:text-os-ink"
          aria-label="Home"
        >
          <Home size={15} />
        </button>

        <input
          ref={inputRef}
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search or enter address"
          aria-label="Address"
          className="min-w-0 flex-1 rounded-lg border-2 border-os-border bg-os-surface px-2 py-1 font-mono text-[11px] text-os-ink outline-none focus:border-os-accent"
        />

        <button
          type="button"
          onClick={handleGoClick}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-os-border-strong bg-os-accent text-os-accent-ink hover:-translate-y-0.5"
          aria-label="Go"
        >
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Content area */}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-os-surface">
        {currentSearchQuery ? (
          <InternetSearchResults
            query={currentSearchQuery}
            loading={searchLoading}
            errorMessage={searchErrorMessage}
            results={searchResults}
            quickAnswer={quickAnswer}
            quickAnswerLoading={quickAnswerLoading}
            onResultClick={handleSearchResultClick}
            onRetry={reload}
          />
        ) : currentUrl ? (
          error ? (
            <InternetErrorState onRetry={reload} />
          ) : (
            <>
              <iframe
                key={`${currentUrl}-${reloadKey}`}
                src={currentUrl}
                title="Internet content"
                className="h-full w-full border-0"
                onLoad={handleLoaded}
                onError={handleLoadError}
              />

              {loading && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-os-surface">
                  <p className="font-mono text-[10px] text-os-ink-soft">
                    loading…
                  </p>
                </div>
              )}
            </>
          )
        ) : (
          <div className="flex h-full flex-col items-center overflow-y-auto px-4 pb-6 text-center">
            <Globe size={28} className="text-os-ink-soft" aria-hidden="true" />

            <p className="mt-3 font-display text-[12px] tracking-(--os-display-tracking) text-os-ink">
              INTERNET
            </p>

            <p className="mt-1 max-w-55 font-mono text-[10px] leading-relaxed text-os-ink-soft">
              Enter a website or search above to begin.
            </p>

            <div className="mt-5 flex w-full max-w-75 flex-col gap-5">
              {trendingSearches.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-os-ink-soft">
                    Trending Searches
                  </p>

                  <div className="flex flex-col">
                    {trendingSearches.map((query) => (
                      <TrendingSearchRow
                        key={query}
                        query={query}
                        onClick={handleRecentSearchClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {bookmarks.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-os-ink-soft">
                    <Bookmark size={9} aria-hidden="true" />
                    Bookmarks
                  </p>

                  <div className="flex flex-col gap-1.5">
                    {bookmarks.map((url) => (
                      <HomeUrlRow
                        key={url}
                        url={url}
                        onClick={handleRecentSiteClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {recentEntries.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-os-ink-soft">
                    <Clock size={9} aria-hidden="true" />
                    Recently viewed
                  </p>

                  <div className="flex flex-col gap-1.5">
                    {recentEntries.map((entry) => (
                      <HomeUrlRow
                        key={entry.value}
                        url={entry.value}
                        onClick={handleRecentSiteClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
