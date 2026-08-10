import { Plus } from 'lucide-react';

export default function CommunityHeader({ onNewPost }) {
  return (
    <div className="border-b-2 border-os-border bg-os-surface-2 px-3.5 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-[13px] text-os-ink">Community</h2>
          <p className="mt-0.5 truncate font-mono text-[9px] text-os-ink-soft">
            Read what others have shared
          </p>
        </div>

        <button
          type="button"
          onClick={onNewPost}
          className="pixel-cut inline-flex shrink-0 items-center gap-1 border-(length:--os-border-width) border-os-border-strong bg-os-accent px-2.5 py-1.5 font-display text-[9px] text-os-accent-ink shadow-[0_2px_0_rgba(0,0,0,.15)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={12} strokeWidth={3} aria-hidden="true" />
          New Post
        </button>
      </div>
    </div>
  );
}
