import { useRef, useState } from 'react';
import { Check, Upload, X, Loader2, Monitor, Sparkles } from 'lucide-react';
import {
  useThemeStore,
  listThemes,
  getThemeSwatchColors,
  getThemePreviewStyle,
  CUSTOM_THEME_ID,
} from '../../../store/useThemeStore';
import { notify } from '../../../store/useNotificationStore';

export default function AppearanceSection() {
  const themeId = useThemeStore((s) => s.themeId);
  const customTheme = useThemeStore((s) => s.customTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const uploadCustomTheme = useThemeStore((s) => s.uploadCustomTheme);
  const removeCustomTheme = useThemeStore((s) => s.removeCustomTheme);
  const themes = listThemes();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadCustomTheme(file);
      notify({ title: 'Custom theme applied', message: `"${file.name}" was uploaded and applied.` });
    } catch (err) {
      notify({ title: 'Could not apply theme', message: err.message ?? 'The theme file is invalid.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveCustom = () => {
    removeCustomTheme();
    notify({ title: 'Custom theme removed', message: 'Switched back to the default theme.' });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[11px] text-os-ink">Desktop Themes</h3>
          <p className="mt-1 max-w-[520px] text-[12px] text-os-ink-soft">
            Pick a complete visual skin. Each preset changes the palette, window geometry, textures, icons and its
            matching wallpaper.
          </p>
        </div>
        <div className="pixel-cut flex shrink-0 items-center gap-1.5 border-[length:var(--os-border-width)] border-os-border-strong bg-os-accent px-2 py-1 font-display text-[8px] text-os-accent-ink">
          <Sparkles size={11} />
          LIVE
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {themes.map((t) => (
          <ThemeTile
            key={t.id}
            id={t.id}
            label={t.label}
            description={t.description}
            selected={themeId === t.id}
            onSelect={() => setTheme(t.id)}
          />
        ))}

        {customTheme ? (
          <div className="relative">
            <ThemeTile
              id={CUSTOM_THEME_ID}
              label={customTheme.label}
              description="Your custom palette"
              selected={themeId === CUSTOM_THEME_ID}
              onSelect={() => setTheme(CUSTOM_THEME_ID)}
            />
            <button
              type="button"
              onClick={handleRemoveCustom}
              aria-label="Remove custom theme"
              title="Remove custom theme"
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
            className="flex min-h-[154px] flex-col items-center justify-center gap-2 rounded-[var(--os-radius-sm)] border-2 border-dashed border-os-border p-4 text-os-ink-soft transition-transform hover:-translate-y-0.5 hover:border-os-accent hover:text-os-ink disabled:opacity-60"
          >
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span className="font-display text-[9px]">{isUploading ? 'Applying…' : 'Upload theme'}</span>
            <span className="max-w-[150px] text-center text-[9px] leading-relaxed">
              JSON palette + shape settings
            </span>
          </button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileChange} className="hidden" />

      <div className="flex items-start gap-2 border-t border-os-border pt-3 text-[10px] leading-relaxed text-os-ink-soft">
        <Monitor size={14} className="mt-0.5 shrink-0" />
        <p>
          Theme changes are instant and persistent. Selecting a preset also switches to its matching wallpaper;
          changing the wallpaper afterwards is allowed.
        </p>
      </div>
    </div>
  );
}

function ThemeTile({ id, label, description, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex w-full flex-col gap-2 rounded-[var(--os-radius-sm)] border-[length:var(--os-border-width)] p-2 text-left transition-transform hover:-translate-y-0.5 ${
        selected ? 'border-os-accent shadow-os-window-focused' : 'border-os-border-strong'
      }`}
    >
      <ThemePreview id={id} />

      <div className="min-w-0 px-1 pb-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-display text-[9px] text-os-ink">{label}</span>
          <span className="shrink-0 text-[8px] text-os-ink-soft">{selected ? 'ACTIVE' : 'APPLY'}</span>
        </div>
        <p className="mt-0.5 truncate text-[9px] text-os-ink-soft">{description}</p>
      </div>

      {selected && (
        <span className="pixel-cut absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center border-[length:var(--os-border-width)] border-os-border-strong bg-os-accent text-os-accent-ink">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function ThemePreview({ id }) {
  const [bg, accent, ink] = getThemeSwatchColors(id);
  const wallpaper = getThemePreviewStyle(id);

  return (
    <div
      className="relative h-[102px] w-full overflow-hidden border border-black/20"
      style={{ backgroundImage: wallpaper.backgroundImage, backgroundSize: wallpaper.backgroundSize }}
    >
      <div className="absolute left-2 top-2 flex flex-col gap-1">
        <MiniIcon color={accent} />
        <MiniIcon color={bg} />
        <MiniIcon color={ink} />
      </div>

      <div className="absolute left-[28%] top-[19%] h-[55%] w-[54%] overflow-hidden border-[length:var(--os-border-width)]" style={{ borderColor: ink, background: bg }}>
        <div className="flex h-4 items-center justify-between px-1" style={{ background: accent, color: ink }}>
          <span className="font-display text-[6px]">Terminal</span>
          <span className="font-mono text-[7px]">×</span>
        </div>
        <div className="p-2 font-mono text-[7px]" style={{ color: ink }}>
          $ whoami
          <br />
          $ ls
          <br />
          $ _
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 border-[length:var(--os-border-width)] px-1.5 py-1" style={{ borderColor: ink, background: bg }}>
        <MiniIcon color={accent} />
        <MiniIcon color={ink} />
        <MiniIcon color={accent} />
        <MiniIcon color={ink} />
      </div>
    </div>
  );
}

function MiniIcon({ color }) {
  return <span className="block h-4 w-4 border border-black/20" style={{ background: color }} />;
}
