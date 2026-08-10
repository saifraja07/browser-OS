import { Loader2 } from 'lucide-react';

export default function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-10 text-center"
    >
      <Loader2 size={20} className="animate-spin text-os-ink-soft" aria-hidden="true" />
      <p className="font-mono text-[10px] text-os-ink-soft">Loading messages…</p>
    </div>
  );
}
