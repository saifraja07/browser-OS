import DesktopIcons from './DesktopIcons';

/**
 * Desktop is the base layer: desktop icons + everything rendered above it.
 *
 * The wallpaper is no longer rendered here — it's the persistent
 * WallpaperLayer mounted once at the App root (see WallpaperLayer.jsx),
 * which stays visible underneath this component. Desktop itself is left
 * without a background so that layer shows through unchanged.
 *
 * Desktop context-menu launching is intentionally disabled; apps can still
 * use the shared context menu where it makes sense (for example Explorer).
 */
export default function Desktop({ children, isMobile = false }) {
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <DesktopIcons isMobile={isMobile} />
      {children}
    </div>
  );
}
