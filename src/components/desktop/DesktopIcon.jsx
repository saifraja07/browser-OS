import { getApp } from "../../core/appRuntime/appRegistry";
import { useWindowStore } from "../../store/useWindowStore";
import {
  useDesktopIconStore,
  selectIconPosition,
} from "../../store/useDesktopIconStore";
import { useDesktopIconDrag } from "../../hooks/useDesktopIconDrag";
import { DESKTOP_LOGOS } from "./desktopLogos";
import { ICON_SIZE, ICON_SIZE_MOBILE } from "../../core/desktopIcons/constants";

/** Same icon, same styling as desktop — just sized down to fit smaller screens. */
const SIZES = {
  desktop: {
    container: ICON_SIZE.width,
    shell: 44,
    icon: 34,
    iconBox: "h-8 w-8",
    label: "text-[9px]",
  },
  mobile: {
    container: ICON_SIZE_MOBILE.width,
    shell: 36,
    icon: 26,
    iconBox: "h-[26px] w-[26px]",
    label: "text-[8px]",
  },
};

/**
 * A single draggable desktop shortcut. Starts out in one of the two
 * default groups (see constants.js — left column / right row, directly
 * below the navbar) but is freely movable from there, exactly like the
 * rest of BrowserOS's desktop icons: drag to reposition (persisted),
 * click to open/focus.
 */
export default function DesktopIcon({ appId, isMobile = false }) {
  const manifest = getApp(appId);
  const position = useDesktopIconStore(selectIconPosition(appId));
  const openApp = useWindowStore((s) => s.openApp);
  const handleOpen = () => openApp(appId);
  const { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } =
    useDesktopIconDrag(appId, handleOpen);

  if (!manifest || !position) return null;

  const Icon = DESKTOP_LOGOS[appId] ?? manifest.icon;
  const size = isMobile ? SIZES.mobile : SIZES.desktop;

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        touchAction: "none",
        width: size.container,
      }}
      className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-(--os-radius-sm) p-1.5 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-os-accent"
      aria-label={manifest.title}
    >
      <span
        style={{
          width: size.shell,
          height: size.shell,
          borderRadius: "var(--os-icon-radius)",
        }}
        className="pixel-cut flex items-center justify-center border-(length:--os-border-width) border-os-border-strong bg-os-surface/90 text-os-ink shadow-os-window transition-shadow duration-150 group-hover:-translate-y-0.5 group-hover:shadow-os-window-focused"
      >
        {Icon ? <Icon size={size.icon} className={size.iconBox} /> : null}
      </span>
      <span
        className={`line-clamp-2 text-center font-display ${size.label} leading-tight text-os-ink [text-shadow:0_1px_0_rgba(0,0,0,0.25)]`}
      >
        {manifest.title}
      </span>
    </button>
  );
}
