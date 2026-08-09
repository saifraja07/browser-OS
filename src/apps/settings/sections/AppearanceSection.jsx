import { useRef, useState } from 'react';
import { Check, Upload, X, Loader2, Monitor } from 'lucide-react';
import { useWallpaperStore, listWallpapers, CUSTOM_WALLPAPER_ID } from '../../../store/useWallpaperStore';
import { notify } from '../../../store/useNotificationStore';

export default function AppearanceSection() {
  const wallpaperId = useWallpaperStore((s) => s.wallpaperId);
  const customWallpaperUrl = useWallpaperStore((s) => s.customWallpaperUrl);
  const setWallpaper = useWallpaperStore((s) => s.setWallpaper);
  const uploadWallpaper = useWallpaperStore((s) => s.uploadWallpaper);
  const removeCustomWallpaper = useWallpaperStore((s) => s.removeCustomWallpaper);
  const wallpapers = listWallpapers();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const isCustomActive = wallpaperId === CUSTOM_WALLPAPER_ID && !!customWallpaperUrl;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadWallpaper(file);
      notify({ title: 'Wallpaper applied', message: `"${file.name}" was uploaded and applied.` });
    } catch (err) {
      notify({ title: 'Could not apply wallpaper', message: err.message ?? 'That file could not be used as a wallpaper.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveCustom = async () => {
    await removeCustomWallpaper();
    notify({ title: 'Custom wallpaper removed', message: 'Switched back to the default wallpaper.' });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display text-[11px] text-os-ink">Theme</h3>
        <p className="mt-1 max-w-[520px] text-[12px] text-os-ink-soft">
          BrowserOS ships with a single, polished Default theme.
        </p>
        <div className="pixel-cut mt-2 inline-flex items-center gap-1.5 border-[length:var(--os-border-width)] border-os-border-strong bg-os-accent px-2.5 py-1.5 font-display text-[9px] text-os-accent-ink">
          <Check size={11} strokeWidth={3} />
          Default
        </div>
      </div>

      <div>
        <h3 className="font-display text-[11px] text-os-ink">Wallpaper</h3>
        <p className="mt-1 max-w-[520px] text-[12px] text-os-ink-soft">
          Pick one of the built-in wallpapers, or upload your own.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-3">
          {wallpapers.map((wp) => (
            <WallpaperTile
              key={wp.id}
              image={wp.image}
              label={wp.label}
              selected={!isCustomActive && wallpaperId === wp.id}
              onSelect={() => setWallpaper(wp.id)}
            />
          ))}

          {isCustomActive ? (
            <div className="relative">
              <WallpaperTile image={customWallpaperUrl} label="Custom" selected onSelect={() => {}} />
              <button
                type="button"
                onClick={handleRemoveCustom}
                aria-label="Remove custom wallpaper"
                title="Remove custom wallpaper"
                className="pixel-cut absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center border-[length:var(--os-border-width)] border-os-border-strong bg-os-danger text-os-surface"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-[var(--os-radius-sm)] border-2 border-dashed border-os-border p-4 text-os-ink-soft transition-transform hover:-translate-y-0.5 hover:border-os-accent hover:text-os-ink disabled:opacity-60"
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              <span className="font-display text-[9px]">{isUploading ? 'Applying…' : 'Upload Wallpaper'}</span>
              <span className="max-w-[150px] text-center text-[9px] leading-relaxed">JPG, PNG, or WEBP</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex items-start gap-2 border-t border-os-border pt-3 text-[10px] leading-relaxed text-os-ink-soft">
        <Monitor size={14} className="mt-0.5 shrink-0" />
        <p>Wallpaper changes are instant and persist across reloads.</p>
      </div>
    </div>
  );
}

function WallpaperTile({ image, label, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex w-full flex-col gap-2 rounded-[var(--os-radius-sm)] border-[length:var(--os-border-width)] p-2 text-left transition-transform hover:-translate-y-0.5 ${
        selected ? 'border-os-accent shadow-os-window-focused' : 'border-os-border-strong'
      }`}
    >
      <div
        className="h-[90px] w-full overflow-hidden border border-black/20 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />

      <div className="flex items-center justify-between gap-2 px-1 pb-1">
        <span className="truncate font-display text-[9px] text-os-ink">{label}</span>
        <span className="shrink-0 text-[8px] text-os-ink-soft">{selected ? 'ACTIVE' : 'APPLY'}</span>
      </div>

      {selected && (
        <span className="pixel-cut absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center border-[length:var(--os-border-width)] border-os-border-strong bg-os-accent text-os-accent-ink">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
