/**
 * A small retro vinyl-disk visual, built entirely from theme CSS variables
 * (border/surface/accent tokens) so it looks correct across every built-in
 * and custom theme without any hardcoded colors.
 *
 * `spinning` drives a CSS animation (see .os-disk-spin in index.css) — it is
 * only ever applied while audio is actually playing, and removed otherwise,
 * so the disk never animates while paused.
 */
export default function Disk({ size = 160, spinning = false, active = false, className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`relative shrink-0 overflow-hidden rounded-full border-[length:var(--os-border-width)] bg-os-surface-2 shadow-os-window ${
        active ? 'border-os-accent' : 'border-os-border-strong'
      } ${spinning ? 'os-disk-spin' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-[8%] rounded-full border-2 border-os-border/60" />
      <div className="absolute inset-[18%] rounded-full border-2 border-os-border/45" />
      <div className="absolute inset-[28%] rounded-full border-2 border-os-border/30" />
      <div
        className={`absolute inset-[38%] rounded-full border-[length:var(--os-border-width)] border-os-border-strong ${
          active ? 'bg-os-accent' : 'bg-os-surface'
        }`}
      />
      <div className="absolute inset-[47%] rounded-full bg-os-ink" />
    </div>
  );
}
