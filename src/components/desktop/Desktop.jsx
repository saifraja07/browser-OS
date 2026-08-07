import { Info, Calculator, FolderOpen, TerminalSquare, Settings as SettingsIcon, Image, BookOpen, CalendarDays, Music2, MessageCircle } from 'lucide-react';
import { useContextMenuStore } from '../../store/useContextMenuStore';
import { useWindowStore } from '../../store/useWindowStore';
import { useWallpaperStore, getWallpaper } from '../../store/useWallpaperStore';

/**
 * The Desktop is the base layer: wallpaper background + right-click menu.
 *
 * Desktop *icons* (files/folders/shortcuts users see on the desktop surface)
 * are still deferred — Explorer now exists as a real window, but rendering
 * live file icons directly on the desktop surface is its own piece of work
 * saved for a later pass. The background pattern is owned by the Wallpaper
 * Manager app + Wallpaper Engine; its colors come from whatever the Theme
 * Engine currently has active, so the two stay independent but composable.
 */
export default function Desktop({ children }) {
  const openContextMenu = useContextMenuStore((s) => s.open);
  const openApp = useWindowStore((s) => s.openApp);
  const wallpaperId = useWallpaperStore((s) => s.wallpaperId);
  const wallpaper = getWallpaper(wallpaperId);

  const handleContextMenu = (e) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, [
      { id: 'explorer', label: 'Open Explorer', icon: FolderOpen, onSelect: () => openApp('explorer') },
      { id: 'terminal', label: 'Open Terminal', icon: TerminalSquare, onSelect: () => openApp('terminal') },
      { id: 'about', label: 'About BrowserOS', icon: Info, onSelect: () => openApp('about') },
      { id: 'readme', label: 'Open README', icon: BookOpen, onSelect: () => openApp('readme') },
      { id: 'calculator', label: 'Open Calculator', icon: Calculator, onSelect: () => openApp('calculator') },
      { id: 'calendar', label: 'Open Calendar', icon: CalendarDays, onSelect: () => openApp('calendar') },
      { id: 'music', label: 'Open Music', icon: Music2, onSelect: () => openApp('music') },
      { id: 'messages', label: 'Open Messages', icon: MessageCircle, onSelect: () => openApp('messages') },
      { id: 'wallpaper', label: 'Change Wallpaper', icon: Image, onSelect: () => openApp('wallpaper') },
      { id: 'settings', label: 'Settings', icon: SettingsIcon, onSelect: () => openApp('settings') },
    ]);
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      className="relative h-screen w-screen overflow-hidden bg-os-bg"
      style={{
        backgroundImage: wallpaper.backgroundImage,
        backgroundSize: wallpaper.backgroundSize,
      }}
    >
      {children}
    </div>
  );
}
