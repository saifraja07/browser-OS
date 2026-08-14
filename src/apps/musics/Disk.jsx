/**
 * Small disc selector used for the five secondary tracks.
 *
 * The large player record uses record.webp; these compact discs intentionally
 * keep the existing BrowserOS CSS treatment so the selector stays lightweight
 * and visually consistent with the rest of the OS.
 */
export default function Disk({ size = 44, active = false, className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`relative shrink-0 overflow-hidden rounded-full border-(length:--os-border-width) bg-os-surface-2 ${
        active ? 'border-os-accent' : 'border-os-border-strong'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-[8%] rounded-full border-2 border-os-border/60" />
      <div className="absolute inset-[18%] rounded-full border-2 border-os-border/45" />
      <div className="absolute inset-[28%] rounded-full border-2 border-os-border/30" />

      <div
        className={`absolute inset-[38%] rounded-full border-(length:--os-border-width) border-os-border-strong ${
          active ? 'bg-os-accent' : 'bg-os-surface'
        }`}
      />

      <div className="absolute inset-[47%] rounded-full bg-os-ink" />
    </div>
  );
} 