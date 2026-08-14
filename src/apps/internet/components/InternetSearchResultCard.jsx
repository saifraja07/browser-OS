import { useState } from "react";
import { Globe } from "lucide-react";


function faviconSrc(domain) {
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(domain)}`;
}

export default function InternetSearchResultCard({ result, onClick }) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const icon = faviconSrc(result.domain);
  const showFavicon = icon && !faviconFailed;

  return (
    <button
      type="button"
      onClick={() => onClick(result.url)}
      title={result.url}
      className="w-full rounded-[14px] border-2 border-os-border-strong bg-os-surface p-3 text-left shadow-[0_2px_0_rgba(0,0,0,.08)] transition-transform hover:-translate-y-0.5 hover:border-os-accent active:translate-y-0"
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded border border-os-border bg-os-surface-2"
        >
          {showFavicon ? (
            <img
              src={icon}
              alt=""
              width={14}
              height={14}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setFaviconFailed(true)}
              className="h-3.5 w-3.5"
            />
          ) : (
            <Globe size={12} className="text-os-ink-soft" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[10px] text-os-accent">
            {result.title}
          </p>
          {result.domain && (
            <p className="truncate font-mono text-[9px] text-os-ink-soft">
              {result.domain}
            </p>
          )}
          {result.snippet && (
            <p className="mt-1 line-clamp-2 font-mono text-[9px] leading-relaxed text-os-ink-soft">
              {result.snippet}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
