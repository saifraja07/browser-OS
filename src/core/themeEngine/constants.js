/**
 * BrowserOS's single visual style: palette, window geometry, texture.
 *
 * Previously this module held several selectable theme packs plus support
 * for uploading a custom JSON theme. BrowserOS now ships one Default theme,
 * so only its CSS variables remain — the exact values the app already
 * booted into by default, so the existing look is unchanged.
 */

function pixelCut(cut) {
  if (cut <= 0) return 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
  return `polygon(0 ${cut}px, ${cut}px ${cut}px, ${cut}px 0, calc(100% - ${cut}px) 0, calc(100% - ${cut}px) ${cut}px, 100% ${cut}px, 100% calc(100% - ${cut}px), calc(100% - ${cut}px) calc(100% - ${cut}px), calc(100% - ${cut}px) 100%, ${cut}px 100%, ${cut}px calc(100% - ${cut}px), 0 calc(100% - ${cut}px))`;
}

export const DEFAULT_THEME_VARS = {
  '--os-titlebar-height': '36px',
  '--os-dock-height': '64px',
  '--os-dock-gap': '10px',
  '--os-icon-size': '44px',
  '--os-icon-radius': '8px',
  '--os-ui-opacity': '0.94',
  '--color-os-bg': '#2f73bd',
  '--color-os-bg-2': '#8cc9e8',
  '--color-os-surface': '#f0eee3',
  '--color-os-surface-2': '#d8d6c9',
  '--color-os-ink': '#171717',
  '--color-os-ink-soft': '#4f514f',
  '--color-os-accent': '#4d91d8',
  '--color-os-accent-ink': '#061a2e',
  '--color-os-mint': '#9ccf69',
  '--color-os-danger': '#c84c3f',
  '--color-os-border': '#8b8b82',
  '--color-os-border-strong': '#171717',
  '--os-radius-window': '3px',
  '--os-radius-sm': '2px',
  '--os-border-width': '2px',
  '--os-clip-corner': pixelCut(2),
  '--os-window-texture': 'repeating-linear-gradient(0deg, rgba(0,0,0,.035) 0 1px, transparent 1px 3px)',
  '--os-window-texture-size': 'auto',
  '--os-display-tracking': '0.03em',
  '--shadow-os-window': '4px 4px 0 rgba(0,0,0,.34), 0 12px 24px rgba(0,0,0,.22)',
  '--shadow-os-window-focused': '5px 5px 0 rgba(0,0,0,.45), 0 14px 28px rgba(0,0,0,.3)',
};
