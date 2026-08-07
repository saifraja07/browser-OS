import { Minus, Square, X } from 'lucide-react';

export default function TitleBar({
  title,
  isFocused,
  isMaximized,
  onPointerDown,
  onMinimize,
  onToggleMaximize,
  onClose,
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={`flex h-9 shrink-0 cursor-grab items-center justify-between border-b-2 px-2 active:cursor-grabbing ${
        isFocused
          ? 'border-os-border-strong bg-os-accent/90'
          : 'border-os-border bg-os-surface-2'
      }`}
    >
      <span
        className={`select-none truncate pl-1 font-display text-[11px] tracking-wide ${
          isFocused ? 'text-os-accent-ink' : 'text-os-ink-soft'
        }`}
      >
        {title}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          data-window-control
          aria-label="Minimize"
          onClick={onMinimize}
          className="pixel-cut flex h-5 w-5 items-center justify-center border-2 border-os-border-strong bg-os-surface text-os-ink transition-transform hover:-translate-y-0.5"
        >
          <Minus size={11} strokeWidth={3} />
        </button>
        <button
          type="button"
          data-window-control
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
          onClick={onToggleMaximize}
          className="pixel-cut flex h-5 w-5 items-center justify-center border-2 border-os-border-strong bg-os-mint text-os-accent-ink transition-transform hover:-translate-y-0.5"
        >
          <Square size={9} strokeWidth={3} />
        </button>
        <button
          type="button"
          data-window-control
          aria-label="Close"
          onClick={onClose}
          className="pixel-cut flex h-5 w-5 items-center justify-center border-2 border-os-border-strong bg-os-danger text-os-surface transition-transform hover:-translate-y-0.5"
        >
          <X size={11} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
