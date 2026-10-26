import { Minus, Square, X } from 'lucide-react';
import { AppIcon } from '../../assets/appIcons';

export default function TitleBar({
  title,
  isFocused,
  isMaximized,
  onPointerDown,
  onMinimize,
  onToggleMaximize,
  onClose,
  appId,
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      style={{ touchAction: 'none' }}
      className="flex h-(--os-titlebar-height) shrink-0 cursor-grab items-center justify-between border-b-(length:--os-border-width) border-os-border-strong bg-os-accent/90 px-2 active:cursor-grabbing"
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {appId ? <AppIcon appId={appId} size={18} className="h-4.5 w-4.5 shrink-0" /> : null}
        <span
          className="select-none truncate pl-1 font-display text-[11px] tracking-(--os-display-tracking) text-os-accent-ink"
        >
          {title}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          data-window-control
          aria-label="Minimize"
          onClick={onMinimize}
          className="pixel-cut flex h-5 w-5 items-center justify-center border-(length:--os-border-width) border-os-border-strong bg-os-surface text-os-ink transition-transform hover:-translate-y-0.5"
        >
          <Minus size={11} strokeWidth={3} />
        </button>
        <button
          type="button"
          data-window-control
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
          onClick={onToggleMaximize}
          className="pixel-cut flex h-5 w-5 items-center justify-center border-(length:--os-border-width) border-os-border-strong bg-os-mint text-os-accent-ink transition-transform hover:-translate-y-0.5"
        >
          <Square size={9} strokeWidth={3} />
        </button>
        <button
          type="button"
          data-window-control
          aria-label="Close"
          onClick={onClose}
          className="pixel-cut flex h-5 w-5 items-center justify-center border-(length:--os-border-width) border-os-border-strong bg-os-danger text-os-surface transition-transform hover:-translate-y-0.5"
        >
          <X size={11} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
