/**
 * Small pixel-art logo set for BrowserOS apps.
 *
 * Each logo is a real, distinct piece of glyph art (not a generic outline
 * icon) built from a crisp-edged grid of rects, matching the OS's pixel-art
 * language. Every component accepts the same `{ size, className }` shape
 * lucide-react icons do, so they drop in anywhere an app's `icon` is
 * currently rendered as `<Icon size={20} />`.
 */

function PixelSvg({ size = 20, className, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ExplorerLogo(props) {
  return (
    <PixelSvg {...props}>
      <rect x="2" y="3" width="6" height="2" fill="currentColor" />
      <rect x="1" y="5" width="14" height="9" fill="currentColor" />
      <rect x="2" y="6" width="12" height="7" fill="var(--color-os-surface)" />
      <rect x="2" y="6" width="12" height="2" fill="var(--color-os-accent)" />
    </PixelSvg>
  );
}

export function CalculatorLogo(props) {
  return (
    <PixelSvg {...props}>
      <rect x="3" y="1" width="10" height="14" fill="currentColor" />
      <rect x="4" y="2" width="8" height="3" fill="var(--color-os-accent)" />
      <rect x="4" y="7" width="2" height="2" fill="var(--color-os-surface)" />
      <rect x="7" y="7" width="2" height="2" fill="var(--color-os-surface)" />
      <rect x="10" y="7" width="2" height="2" fill="var(--color-os-surface)" />
      <rect x="4" y="10" width="2" height="2" fill="var(--color-os-surface)" />
      <rect x="7" y="10" width="2" height="2" fill="var(--color-os-surface)" />
      <rect x="10" y="10" width="2" height="4" fill="var(--color-os-surface)" />
      <rect x="4" y="13" width="5" height="1" fill="var(--color-os-surface)" />
    </PixelSvg>
  );
}

export function MusicLogo(props) {
  return (
    <PixelSvg {...props}>
      <circle cx="8" cy="8" r="6.5" fill="currentColor" />
      <circle cx="8" cy="8" r="4.5" fill="var(--color-os-accent)" />
      <circle cx="8" cy="8" r="1.4" fill="var(--color-os-surface)" />
      <rect x="10" y="4" width="1.6" height="1.6" fill="var(--color-os-surface)" opacity="0.85" />
    </PixelSvg>
  );
}

export function SettingsLogo(props) {
  return (
    <PixelSvg {...props}>
      <rect x="7" y="0" width="2" height="3" fill="currentColor" />
      <rect x="7" y="13" width="2" height="3" fill="currentColor" />
      <rect x="0" y="7" width="3" height="2" fill="currentColor" />
      <rect x="13" y="7" width="3" height="2" fill="currentColor" />
      <rect x="2.3" y="2.3" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 3.5 3.5)" />
      <rect x="11.3" y="2.3" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 12.5 3.5)" />
      <rect x="2.3" y="11.3" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 3.5 12.5)" />
      <rect x="11.3" y="11.3" width="2.4" height="2.4" fill="currentColor" transform="rotate(45 12.5 12.5)" />
      <circle cx="8" cy="8" r="5" fill="currentColor" />
      <circle cx="8" cy="8" r="2.6" fill="var(--color-os-accent)" />
    </PixelSvg>
  );
}


export function ReadmeLogo(props) {
  return (
    <PixelSvg {...props}>
      <rect x="3" y="1" width="10" height="14" fill="currentColor" />
      <rect x="4" y="2" width="8" height="12" fill="var(--color-os-surface)" />
      <rect x="5" y="4" width="6" height="1" fill="var(--color-os-accent)" />
      <rect x="5" y="7" width="5" height="1" fill="currentColor" />
      <rect x="5" y="9" width="6" height="1" fill="currentColor" />
      <rect x="5" y="11" width="4" height="1" fill="currentColor" />
    </PixelSvg>
  );
}

export function TerminalLogo(props) {
  return (
    <PixelSvg {...props}>
      <rect x="1" y="2" width="14" height="12" fill="currentColor" />
      <rect x="2" y="3" width="12" height="9" fill="var(--color-os-surface-2)" />
      <rect x="4" y="5" width="2" height="1" fill="var(--color-os-accent)" />
      <rect x="5" y="6" width="2" height="1" fill="var(--color-os-accent)" />
      <rect x="7" y="7" width="1" height="1" fill="var(--color-os-accent)" />
      <rect x="9" y="9" width="3" height="1" fill="currentColor" />
    </PixelSvg>
  );
}

export function CalendarLogo(props) {
  return (
    <PixelSvg {...props}>
      <rect x="2" y="2" width="12" height="12" fill="currentColor" />
      <rect x="3" y="5" width="10" height="8" fill="var(--color-os-surface)" />
      <rect x="3" y="3" width="10" height="3" fill="var(--color-os-accent)" />
      <rect x="5" y="7" width="2" height="2" fill="currentColor" />
      <rect x="9" y="7" width="2" height="2" fill="currentColor" />
      <rect x="5" y="10" width="2" height="2" fill="currentColor" />
      <rect x="9" y="10" width="2" height="2" fill="currentColor" />
    </PixelSvg>
  );
}

export function MessagesLogo(props) {
  return (
    <PixelSvg {...props}>
      <rect x="2" y="2" width="12" height="9" fill="currentColor" />
      <rect x="3" y="3" width="10" height="7" fill="var(--color-os-accent)" />
      <rect x="4" y="11" width="3" height="2" fill="currentColor" />
      <rect x="5" y="5" width="5" height="1" fill="var(--color-os-accent-ink)" />
      <rect x="5" y="7" width="3" height="1" fill="var(--color-os-accent-ink)" />
    </PixelSvg>
  );
}
