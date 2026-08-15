import { Search } from "lucide-react";
import InternetSearchLoading from "./InternetSearchLoading";
import InternetSearchEmpty from "./InternetSearchEmpty";
import InternetSearchError from "./InternetSearchError";
import InternetSearchResultCard from "./InternetSearchResultCard";
import InternetAnswerView from "./InternetAnswerView";

export default function InternetSearchResults({
  query,
  loading,
  errorMessage,
  results,
  quickAnswer,
  quickAnswerLoading,
  onResultClick,
  onRetry,
}) {
  if (loading) return <InternetSearchLoading query={query} />;
  if (errorMessage) return <InternetSearchError message={errorMessage} onRetry={onRetry} />;

  // Guard against a premature "no results" flash: if there are no web
  // results yet but the Wikipedia lookup hasn't settled, wait for it —
  // it may still turn into a detailed answer worth showing.
  const noContentYet = results.length === 0 && !quickAnswer?.found;
  if (noContentYet && quickAnswerLoading) return <InternetSearchLoading query={query} />;
  if (noContentYet) return <InternetSearchEmpty query={query} />;

  // Strong Wikipedia match: answer-first layout (unboxed answer + up to
  // two boxed source cards), and nothing else — see InternetAnswerView.
  if (quickAnswer?.found) {
    return (
      <InternetAnswerView
        answer={quickAnswer}
        results={results}
        onResultClick={onResultClick}
      />
    );
  }

  // No Wikipedia answer (irrelevant query, or Wikipedia unavailable):
  // fall back to the existing plain results list, unchanged.
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b-2 border-os-border bg-os-surface-2 px-3 py-2.5">
        <p className="font-display text-[11px] tracking-(--os-display-tracking) text-os-ink">
          SEARCH RESULTS
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate font-mono text-[9px] text-os-ink-soft">
          <Search size={9} className="shrink-0" aria-hidden="true" />
          <span className="truncate">Results for “{query}”</span>
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
        <div className="flex flex-col gap-2">
          {results.map((result) => (
            <InternetSearchResultCard
              key={result.url}
              result={result}
              onClick={onResultClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
