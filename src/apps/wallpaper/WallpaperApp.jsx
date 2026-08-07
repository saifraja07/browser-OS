import { Check } from 'lucide-react';
import { useWallpaperStore, listWallpapers, getWallpaper } from '../../store/useWallpaperStore';

export default function WallpaperApp() {
  const wallpaperId = useWallpaperStore((s) => s.wallpaperId);
  const setWallpaper = useWallpaperStore((s) => s.setWallpaper);
  const wallpapers = listWallpapers();

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div>
        <h2 className="font-display text-[11px] text-os-ink">Wallpaper</h2>
        <p className="mt-1 text-[12px] text-os-ink-soft">
          Patterns use your current theme's colors, so they always match.
        </p>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 overflow-auto">
        {wallpapers.map((wp) => {
          const style = getWallpaper(wp.id);
          const isActive = wallpaperId === wp.id;
          return (
            <button
              key={wp.id}
              onClick={() => setWallpaper(wp.id)}
              className={`relative flex flex-col gap-2 rounded-xl border-2 p-2 transition-transform hover:-translate-y-0.5 ${
                isActive ? 'border-os-accent' : 'border-os-border-strong'
              }`}
            >
              <div
                className="h-20 w-full rounded-lg border border-black/10"
                style={{ backgroundImage: style.backgroundImage, backgroundSize: style.backgroundSize }}
              />
              <span className="font-display text-[9px] text-os-ink">{wp.label}</span>
              {isActive && (
                <span className="pixel-cut absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center border-2 border-os-border-strong bg-os-accent text-os-accent-ink">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
