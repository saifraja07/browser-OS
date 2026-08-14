import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * Shown when a search request fails (provider error, timeout, network
 * failure, misconfiguration, etc — internetSearchService already reduces
 * all of these to a single user-safe message). Styled to match
 * InternetErrorState so the two failure states feel like the same app.
 */
export default function InternetSearchError({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center"
    >
      <AlertTriangle size={22} className="text-os-danger" aria-hidden="true" />
      <p className="font-display text-[12px] tracking-(--os-display-tracking) text-os-ink">
        SEARCH COULD NOT BE COMPLETED
      </p>
      <p className="max-w-70 font-mono text-[10px] leading-relaxed text-os-ink-soft">
        {message || "Something went wrong while searching. Please try again."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="pixel-cut inline-flex items-center gap-1.5 border-(length:--os-border-width) border-os-border-strong bg-os-surface px-3 py-1.5 font-display text-[9px] text-os-ink shadow-[0_2px_0_rgba(0,0,0,.1)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <RotateCw size={11} strokeWidth={3} aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}
