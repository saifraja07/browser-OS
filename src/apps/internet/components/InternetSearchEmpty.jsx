import { SearchX } from "lucide-react";

export default function InternetSearchEmpty({ query }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-10 text-center">
      <SearchX size={22} className="text-os-ink-soft" aria-hidden="true" />
      <p className="font-display text-[12px] tracking-(--os-display-tracking) text-os-ink">
        NO RESULTS
      </p>
      <p className="max-w-70 font-mono text-[10px] leading-relaxed text-os-ink-soft">
        No results were found for “{query}”.
      </p>
    </div>
  );
}
