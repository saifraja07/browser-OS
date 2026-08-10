import { Search, X } from 'lucide-react';

export default function CommunitySearch({ value, onChange }) {
  return (
    <div className="border-b-2 border-os-border bg-os-surface px-3.5 py-2.5">
      <div className="relative">
        <Search
          size={13}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-os-ink-soft"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search messages..."
          aria-label="Search messages"
          className="w-full min-w-0 rounded-lg border-2 border-os-border bg-os-surface-2 py-1.5 pl-8 pr-8 font-mono text-[11px] text-os-ink outline-none placeholder:text-os-ink-soft focus:border-os-accent"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-os-ink-soft hover:text-os-ink"
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
