import { Check } from 'lucide-react';
import { useThemeStore, listThemes } from '../../../store/useThemeStore';

export default function AppearanceSection() {
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const themes = listThemes();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-[11px] text-os-ink">Theme</h3>
        <p className="mt-1 text-[12px] text-os-ink-soft">
          Applies instantly across every window and the desktop.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-transform hover:-translate-y-0.5 ${
              themeId === t.id ? 'border-os-accent' : 'border-os-border-strong'
            }`}
          >
            <ThemeSwatch id={t.id} />
            <span className="font-display text-[9px] text-os-ink">{t.label}</span>
            {themeId === t.id && (
              <span className="pixel-cut absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center border-2 border-os-border-strong bg-os-accent text-os-accent-ink">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

const SWATCH_COLORS = {
  'dusk-lavender': ['#c9c2e0', '#ff8b5e', '#2b2438'],
  'arcade-mint': ['#1c1830', '#6fcf97', '#eae6f5'],
  'sunset-sand': ['#f0c9a0', '#d84f57', '#4a2c1f'],
};

function ThemeSwatch({ id }) {
  const [bg, accent, ink] = SWATCH_COLORS[id] ?? ['#ccc', '#999', '#333'];
  return (
    <div
      className="flex h-12 w-full items-end justify-center rounded-lg border border-black/10 p-1.5"
      style={{ background: bg }}
    >
      <div className="flex gap-1">
        <span className="h-3 w-3 rounded-sm" style={{ background: accent }} />
        <span className="h-3 w-3 rounded-sm" style={{ background: ink }} />
      </div>
    </div>
  );
}
