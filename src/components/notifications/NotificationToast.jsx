import { memo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useNotificationStore, selectNotification } from '../../store/useNotificationStore';

function NotificationToast({ id }) {
  const notification = useNotificationStore(selectNotification(id));
  const dismiss = useNotificationStore((s) => s.dismiss);

  if (!notification) return null;
  const Icon = notification.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="pointer-events-auto flex w-72 items-start gap-2.5 rounded-xl border-2 border-os-border-strong bg-os-surface p-3 shadow-os-window"
    >
      {Icon && (
        <span className="pixel-cut mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border-2 border-os-border-strong bg-os-accent text-os-accent-ink">
          <Icon size={14} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[10px] text-os-ink">{notification.title}</p>
        {notification.message && (
          <p className="mt-1 text-[12px] leading-snug text-os-ink-soft">{notification.message}</p>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dismiss(id)}
        className="shrink-0 rounded-md p-0.5 text-os-ink-soft hover:bg-os-surface-2 hover:text-os-ink"
      >
        <X size={13} />
      </button>
    </motion.div>
  );
}

export default memo(NotificationToast);
