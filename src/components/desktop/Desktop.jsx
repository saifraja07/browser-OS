import { useWallpaperStore, getActiveWallpaperSrc } from '../../store/useWallpaperStore';
import DesktopIcons from './DesktopIcons';

/**
 * Desktop is the base layer: wallpaper background + desktop icons.
 * Desktop context-menu launching is intentionally disabled; apps can still
 * use the shared context menu where it makes sense (for example Explorer).
 */
export default function Desktop({ children, isMobile = false }) {
  const wallpaperSrc = useWallpaperStore(getActiveWallpaperSrc);

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-os-bg"
      style={{
        backgroundImage: `url(${wallpaperSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <DesktopIcons isMobile={isMobile} />
      {children}
    </div>
  );
}
