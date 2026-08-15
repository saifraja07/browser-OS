import InternetSearchResultCard from "./InternetSearchResultCard";
import { selectSecondSource } from "../selectSecondSource";

/**
 * Answer-first search layout: the Wikipedia-derived answer renders as
 * plain, unboxed article text (no card/border — it should read like
 * normal browser content), followed by a "Sources" section that reuses
 * the existing InternetSearchResultCard styling for up to two boxed
 * links — Wikipedia itself, plus the best additional authoritative
 * source `selectSecondSource` finds among the existing search results.
 *
 * Rendered only when useInternetSearch resolves a strong Wikipedia
 * match (`quickAnswer.found`); otherwise InternetSearchResults falls
 * back to the plain existing results list.
 */
export default function InternetAnswerView({ answer, results, onResultClick }) {
  const secondSource = selectSecondSource(results);

  const wikipediaSource = {
    title: `${answer.title} — Wikipedia`,
    domain: "en.wikipedia.org",
    url: answer.url,
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
        <div className="mx-auto flex w-full max-w-190 flex-col gap-4">
          <article className="flex flex-col gap-3">
            <h1 className="font-display text-[13px] tracking-(--os-display-tracking) text-os-ink">
              {answer.title}
            </h1>

            <div className="flex flex-col gap-2.5">
              {answer.paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="wrap-break-word font-mono text-[11px] leading-relaxed text-os-ink-soft"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>

          <div>
            <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-os-ink-soft">
              Sources
            </p>

            <div className="flex flex-col gap-2">
              <InternetSearchResultCard
                result={wikipediaSource}
                onClick={onResultClick}
              />
              {secondSource && (
                <InternetSearchResultCard
                  result={secondSource}
                  onClick={onResultClick}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
