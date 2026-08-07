export const STORAGE_KEY = 'browseros:wallpaper';
export const DEFAULT_WALLPAPER_ID = 'diagonal-dots';

/**
 * Each preset is a CSS background-image/background-size pair built from the
 * theme's CSS custom properties (--color-os-bg, --color-os-accent, etc.)
 * rather than hardcoded colors — Theme Engine owns the palette, Wallpaper
 * Manager only owns the pattern layered on top of it. The two stay decoupled.
 */
export const WALLPAPERS = {
  'diagonal-dots': {
    label: 'Diagonal Dots',
    backgroundImage:
      'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(160deg, var(--color-os-bg) 0%, var(--color-os-bg-2) 100%)',
    backgroundSize: '18px 18px, 100% 100%',
  },
  'radial-glow': {
    label: 'Radial Glow',
    backgroundImage:
      'radial-gradient(circle at 50% 25%, color-mix(in srgb, var(--color-os-accent) 20%, var(--color-os-bg)) 0%, var(--color-os-bg) 65%)',
    backgroundSize: '100% 100%',
  },
  'pixel-grid': {
    label: 'Pixel Grid',
    backgroundImage:
      'linear-gradient(var(--color-os-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-os-border) 1px, transparent 1px), linear-gradient(160deg, var(--color-os-bg) 0%, var(--color-os-bg-2) 100%)',
    backgroundSize: '24px 24px, 24px 24px, 100% 100%',
  },
  'arcade-stripes': {
    label: 'Arcade Stripes',
    backgroundImage:
      'repeating-linear-gradient(135deg, var(--color-os-bg) 0px, var(--color-os-bg) 22px, var(--color-os-bg-2) 22px, var(--color-os-bg-2) 44px)',
    backgroundSize: 'auto',
  },
  solid: {
    label: 'Solid',
    backgroundImage: 'linear-gradient(var(--color-os-bg), var(--color-os-bg))',
    backgroundSize: '100% 100%',
  },
};

export const WALLPAPER_IDS = Object.keys(WALLPAPERS);
