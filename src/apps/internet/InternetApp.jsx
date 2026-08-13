import { useEffect, useRef, useState } from "react";
import { ArrowLeft, RotateCw, Home, ArrowRight, Globe } from "lucide-react";
import { useInternetHistory } from "./useInternetHistory";
import InternetErrorState from "./InternetErrorState";

const recentSites = [
  "http://browser-os-one.vercel.app",
  "http://listen2gold.vercel.app",
  "http://mirhaadi.in",
];

/**
 * Internet — a very small retro web browser.
 *
 * Phase 5 (this file): custom error/fallback UI. When a page can't be
 * confirmed to have loaded — whether from a genuine network error or a
 * site refusing to be embedded (CSP/X-Frame-Options, which this app never
 * attempts to bypass) — the iframe is swapped for a local BrowserOS-styled
 * error view instead of leaving a blank/broken pane. The toolbar (Back,
 * Reload, Home, the address input, Go) stays fully usable throughout.
 */
export default function InternetApp() {
  const [inputUrl, setInputUrl] = useState("");
  const inputRef = useRef(null);

  const {
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
  } = useInternetHistory();

  // The address bar always mirrors whatever page is actually displayed.
  useEffect(() => {
    setInputUrl(currentUrl ?? "");
  }, [currentUrl]);

  const goTo = (rawInput) => {
    const normalized = navigate(rawInput);

    if (!normalized) {
      inputRef.current?.focus();
    }
  };

  const handleGoClick = () => goTo(inputUrl);

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goTo(inputUrl);
    }
  };

  const handleRecentSiteClick = (url) => {
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
          onClick={reload}
          disabled={!currentUrl}
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
          placeholder="Enter address"
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
        {currentUrl ? (
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
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <Globe size={28} className="text-os-ink-soft" aria-hidden="true" />

            <p className="font-display text-[12px] tracking-(--os-display-tracking) text-os-ink">
              INTERNET
            </p>

            <p className="max-w-55 font-mono text-[10px] leading-relaxed text-os-ink-soft">
              Enter a website above to begin.
            </p>

            {/* Recently viewed */}
            <div className="mt-2 w-full max-w-75">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-os-ink-soft">
                Recently viewed
              </p>

              <div className="flex flex-col gap-1.5">
                {recentSites.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => handleRecentSiteClick(url)}
                    className="w-full truncate rounded border-2 border-os-border bg-os-surface-2 px-2 py-1.5 text-left font-mono text-[10px] text-os-ink hover:border-os-accent hover:bg-os-surface hover:text-os-accent"
                  >
                    {url}
                  </button>
                ))}
              </div>
            </div>

            <p className="max-w-55 font-mono text-[10px] leading-relaxed text-os-ink-soft">
              This app is currently under development.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
