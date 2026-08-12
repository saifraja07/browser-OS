import { motion } from "framer-motion";

/**
 * The small dark-header panel shell shared by the Wi-Fi, Battery, and
 * Date & Time popovers — same border/shadow/radius language as windows
 * and the dock, just sized for a compact status readout.
 */
export default function SystemPanel({
  title,
  onClose,
  children,
  className = "",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.12 }}
      role="dialog"
      aria-label={title}
      className={`pixel-cut w-60 overflow-hidden border-(length:--os-border-width) border-os-border-strong bg-os-surface shadow-os-window ${className}`}
    >
      <div className="flex items-center justify-between bg-os-ink px-3 py-2">
        <span className="font-display text-[11px] tracking-(--os-display-tracking) text-os-surface">
          {title}
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="
    relative
    flex
    h-3.5
    w-3.5
    shrink-0
    items-center
    justify-center
    rounded-full
    bg-os-danger
    hover:scale-110
  "
        >
          <span
            className="
      absolute
      left-1/2
      top-1/2
      h-px
      w-1.75
      -translate-x-1/2
      -translate-y-1/2
      rotate-45
      bg-os-surface
    "
          />

          <span
            className="
      absolute
      left-1/2
      top-1/2
      h-px
      w-1.75
      -translate-x-1/2
      -translate-y-1/2
      -rotate-45
      bg-os-surface
    "
          />
        </button>
      </div>

      <div className="p-3.5 text-[12px] text-os-ink">{children}</div>
    </motion.div>
  );
}
