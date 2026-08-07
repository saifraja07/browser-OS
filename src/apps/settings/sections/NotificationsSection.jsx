import { BellRing } from 'lucide-react';
import { useNotificationStore, notify } from '../../../store/useNotificationStore';

export default function NotificationsSection() {
  const enabled = useNotificationStore((s) => s.enabled);
  const setEnabled = useNotificationStore((s) => s.setEnabled);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-[11px] text-os-ink">Notifications</h3>
        <p className="mt-1 text-[12px] text-os-ink-soft">
          Control whether apps can show toast notifications.
        </p>
      </div>

      <label className="flex items-center justify-between rounded-xl border-2 border-os-border-strong p-3">
        <span className="text-[13px] text-os-ink">Enable notifications</span>
        <button
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled(!enabled)}
          className={`relative h-6 w-11 rounded-full border-2 border-os-border-strong transition-colors ${
            enabled ? 'bg-os-accent' : 'bg-os-surface-2'
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-os-surface transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </label>

      <button
        disabled={!enabled}
        onClick={() =>
          notify({ title: 'Test Notification', message: 'Notifications are working correctly.', icon: BellRing })
        }
        className="flex items-center justify-center gap-2 rounded-lg border-2 border-os-border-strong bg-os-surface-2 py-2 text-[12px] text-os-ink enabled:hover:bg-os-accent enabled:hover:text-os-accent-ink disabled:opacity-40"
      >
        <BellRing size={14} /> Send test notification
      </button>
    </div>
  );
}
