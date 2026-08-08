import { getApp } from '../../core/appRuntime/appRegistry';
import { useWindowStore } from '../../store/useWindowStore';
import { useDesktopIconStore, selectIconPosition } from '../../store/useDesktopIconStore';
import { useDesktopIconDrag } from '../../hooks/useDesktopIconDrag';
import { DESKTOP_LOGOS } from './desktopLogos';

export default function DesktopIcon({ appId }) {
  const manifest = getApp(appId);
  const position = useDesktopIconStore(selectIconPosition(appId));
  const openApp = useWindowStore((s) => s.openApp);

  const handleOpen = () => openApp(appId);
  const { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } = useDesktopIconDrag(
    appId,
    handleOpen
  );

  if (!manifest || !position) return null;

  const Icon = DESKTOP_LOGOS[appId] ?? manifest.icon;

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{ position: 'absolute', left: position.x, top: position.y, touchAction: 'none' }}
      className="group flex w-[76px] cursor-pointer flex-col items-center gap-1.5 rounded-[var(--os-radius-sm)] p-1.5 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-os-accent"
      aria-label={manifest.title}
    >
      <span className="pixel-cut os-icon-shell flex items-center justify-center border-[length:var(--os-border-width)] border-os-border-strong bg-os-surface/90 text-os-ink shadow-os-window transition-transform transition-shadow duration-150 group-hover:-translate-y-0.5 group-hover:shadow-os-window-focused">
        {Icon ? <Icon size={34} className="h-8 w-8" /> : null}
      </span>
      <span className="line-clamp-2 text-center font-display text-[9px] leading-tight text-os-ink [text-shadow:0_1px_0_rgba(0,0,0,0.25)]">
        {manifest.title}
      </span>
    </button>
  );
}
