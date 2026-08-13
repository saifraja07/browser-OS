import { AlertTriangle, RotateCw } from 'lucide-react';

/**
 * Shown in place of the iframe when a page can't be confirmed to have
 * loaded (see useInternetHistory's load-timeout comment for why this is a
 * best-effort heuristic, not a guarantee). Purely local to Internet — this
 * doesn't touch or replace any of BrowserOS's own error handling.
 */
export default function InternetErrorState({ onRetry }) {
  return (
    <div
      role="alert"
      className="flex h-full flex-col items-center justify-center gap-3 px-4 py-10 text-center"
    >
      <p className="font-display text-[11px] tracking-[var(--os-display-tracking)] text-os-ink-soft">
        INTERNET
      </p>
      <AlertTriangle size={22} className="text-os-danger" aria-hidden="true" />
      <p className="font-display text-[12px] tracking-[var(--os-display-tracking)] text-os-ink">
        PAGE COULD NOT LOAD
      </p>
      <p className="max-w-[240px] font-mono text-[10px] leading-relaxed text-os-ink-soft">
        The website couldn't be displayed inside BrowserOS Internet. Some
        sites don't allow this, or the address may be unreachable.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="pixel-cut inline-flex items-center gap-1.5 border-[length:var(--os-border-width)] border-os-border-strong bg-os-surface px-3 py-1.5 font-display text-[9px] text-os-ink shadow-[0_2px_0_rgba(0,0,0,.1)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <RotateCw size={11} strokeWidth={3} aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}
