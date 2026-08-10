import { MessagesSquare, SearchX } from 'lucide-react';

export default function EmptyState({ searching = false }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      {searching ? (
        <SearchX size={22} className="text-os-ink-soft" aria-hidden="true" />
      ) : (
        <MessagesSquare size={22} className="text-os-ink-soft" aria-hidden="true" />
      )}
      <p className="font-display text-[11px] text-os-ink">
        {searching ? 'No messages found.' : 'No messages yet.'}
      </p>
      {!searching && (
        <p className="max-w-[220px] font-mono text-[9px] leading-relaxed text-os-ink-soft">
          Be the first to share something with the community.
        </p>
      )}
    </div>
  );
}
