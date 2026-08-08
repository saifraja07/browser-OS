import { useWallpaperStore, getWallpaper } from '../../store/useWallpaperStore';
import DesktopIcons from './DesktopIcons';

/**
 * Desktop is the base layer: wallpaper background + desktop icons.
 * Desktop context-menu launching is intentionally disabled; apps can still
 * use the shared context menu where it makes sense (for example Explorer).
 */
export default function Desktop({ children, isMobile = false }) {
  const wallpaperId = useWallpaperStore((s) => s.wallpaperId);
  const wallpaper = getWallpaper(wallpaperId);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-os-bg"
      style={{
        backgroundImage: wallpaper.backgroundImage,
        backgroundSize: wallpaper.backgroundSize,
      }}
    >
      {/* Mobile's primary navigation is the 3-icon dock + All Apps menu,
          not scattered desktop icons — see MobileDock/MobileAppsMenu. */}
      {!isMobile && <DesktopIcons />}
      {children}
    </div>
  );
}
