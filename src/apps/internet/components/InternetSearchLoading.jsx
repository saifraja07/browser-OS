import { Loader2 } from "lucide-react";

export default function InternetSearchLoading({ query }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center"
    >
      <Loader2
        size={22}
        className="animate-spin text-os-ink-soft"
        aria-hidden="true"
      />
      <p className="font-display text-[12px] tracking-(--os-display-tracking) text-os-ink">
        SEARCHING…
      </p>
      <p className="max-w-70 font-mono text-[10px] leading-relaxed text-os-ink-soft">
        Searching the web for
        <br />
        <span className="text-os-ink">“{query}”</span>
      </p>
    </div>
  );
}
