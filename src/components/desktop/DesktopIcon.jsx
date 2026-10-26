import { getApp } from "../../core/appRuntime/appRegistry";
import { useWindowStore } from "../../store/useWindowStore";
import {
  useDesktopIconStore,
  selectIconPosition,
} from "../../store/useDesktopIconStore";
import { useDesktopIconDrag } from "../../hooks/useDesktopIconDrag";
import { FOLDER_SHORTCUTS } from "../../core/desktopIcons/folderShortcuts";
import { useSocialsStore } from "../../store/useSocialsStore";
import { SOCIALS_TRIGGER_ATTR } from "./socials/SocialsPopup";
import { DESKTOP_LOGOS } from "./desktopLogos";

/**
 * Same icon, same styling as desktop — just sized down to fit smaller
 * screens. `container` here is the actual tappable button width, kept
 * snug around `shell` (the visible icon square) rather than reusing the
 * wider grid-spacing constants from desktopIcons/constants.js (ICON_SIZE /
 * ICON_SIZE_MOBILE) — those exist purely to keep icons from overlapping
 * each other in the default layout and were never meant to define how big
 * the clickable area should be. Reusing them here meant tapping well
 * outside the visible icon (and its label) still opened the app. 48px
 * (mobile) / 60px (desktop) still comfortably clears standard touch-target
 * guidance (Apple ~44pt, Material 48dp) without the extra dead margin.
 */
const SIZES = {
  desktop: {
    container: 60,
    shell: 44,
    icon: 34,
    iconBox: "h-8 w-8",
    bareIcon: 42,
    bareBox: "h-[42px] w-[42px]",
    label: "text-[9px]",
  },
  mobile: {
    container: 48,
    shell: 36,
    icon: 26,
    iconBox: "h-[26px] w-[26px]",
    bareIcon: 34,
    bareBox: "h-[34px] w-[34px]",
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
  // Folder shortcuts (e.g. My Socials) aren't registered apps — they toggle
  // their own popup instead of opening a window.
  const folder = FOLDER_SHORTCUTS[appId];
  const manifest = folder ?? getApp(appId);
  const position = useDesktopIconStore(selectIconPosition(appId));
  const openApp = useWindowStore((s) => s.openApp);
  const toggleSocials = useSocialsStore((s) => s.toggle);
  const isFolderOpen = useSocialsStore((s) => appId === "socials" && s.isOpen);
  const handleOpen = () => (folder ? toggleSocials() : openApp(appId));
  const { onPointerDown, onPointerMove, onPointerUp, onPointerCancel } =
    useDesktopIconDrag(appId, handleOpen);

  if (!manifest || !position) return null;

  const Icon = DESKTOP_LOGOS[appId] ?? manifest.icon;
  const size = isMobile ? SIZES.mobile : SIZES.desktop;
  // My Socials is the one icon that keeps a tile — restyled as frosted glass.
  // Every other desktop icon is just its artwork on the wallpaper.
  const isGlass = appId === "socials";

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
      className="group flex cursor-pointer flex-col items-center gap-1 rounded-(--os-radius-sm) p-0.5 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-os-accent"
      aria-label={manifest.title}
      {...(folder
        ? {
          [SOCIALS_TRIGGER_ATTR]: "",
          "aria-haspopup": "dialog",
          "aria-expanded": isFolderOpen,
        }
        : null)}
    >
      <span
        style={{
          width: size.shell,
          height: size.shell,
          borderRadius: isGlass ? 10 : undefined,
        }}
        className={`flex items-center justify-center text-os-ink transition-[transform,background-color,box-shadow] duration-150 group-hover:-translate-y-0.5 ${isGlass
            ? "border border-white/45 bg-white/20 shadow-[0_8px_24px_rgba(31,38,135,0.25),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-md group-hover:bg-white/30"
            : ""
          }`}
      >
        {Icon ? (
          <Icon
            size={isGlass ? size.icon : size.bareIcon}
            className={
              isGlass
                ? size.iconBox
                : `${size.bareBox} drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]`
            }
          />
        ) : null}
      </span>
      <span
        className={`line-clamp-2 text-center font-display ${size.label} leading-tight text-os-ink [text-shadow:0_1px_0_rgba(0,0,0,0.25)]`}
      >
        {manifest.title}
      </span>
    </button>
  );
}
