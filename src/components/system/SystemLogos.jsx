/**
 * Small pixel-art glyphs for the boot/login layer. Kept local to this
 * folder (rather than added to assets/appLogos) since these are system
 * chrome, not app icons — but they follow the exact same crisp-edged
 * rect-grid language as the rest of BrowserOS.
 */

function PixelSvg({ size = 20, className, viewBox = '0 0 16 16', children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Browser-window brand mark used on the boot screen. */
export function BrowserOSLogo({ size = 48, className }) {
  return (
    <PixelSvg size={size} className={className}>
      <rect x="1" y="2" width="14" height="12" fill="var(--color-os-border-strong)" />
      <rect x="2" y="4.5" width="12" height="8.5" fill="var(--color-os-surface)" />
      <rect x="1" y="2" width="14" height="2.5" fill="var(--color-os-accent)" />
      <rect x="2.5" y="2.7" width="1.1" height="1.1" fill="var(--color-os-surface)" />
      <rect x="4.1" y="2.7" width="1.1" height="1.1" fill="var(--color-os-surface)" />
      <rect x="5.7" y="2.7" width="1.1" height="1.1" fill="var(--color-os-surface)" />
      <rect x="4" y="6.4" width="8" height="1.5" fill="var(--color-os-accent)" />
      <rect x="4" y="8.7" width="5" height="1.5" fill="var(--color-os-border)" />
      <rect x="4" y="11" width="6.5" height="1.5" fill="var(--color-os-border)" />
    </PixelSvg>
  );
}

/** Minimal pixel-art figure used as the login screen's user avatar. */
export function DashAvatar({ size = 48, className }) {
  return (
    <PixelSvg size={size} className={className}>
      <circle cx="8" cy="8" r="8" fill="var(--color-os-accent)" />
      <path d="M4 9.5c0-2.9 1.8-5 4-5s4 2.1 4 5" fill="var(--color-os-border-strong)" />
      <circle cx="8" cy="9" r="3.2" fill="#f2c9a0" />
      <rect x="6.3" y="8.6" width="1" height="1" fill="var(--color-os-border-strong)" />
      <rect x="8.7" y="8.6" width="1" height="1" fill="var(--color-os-border-strong)" />
      <path
        d="M8 16a8 8 0 0 0 6.2-2.9c-.5-2.1-3.1-3.6-6.2-3.6s-5.7 1.5-6.2 3.6A8 8 0 0 0 8 16Z"
        fill="var(--color-os-border-strong)"
      />
    </PixelSvg>
  );
}
