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

      <div className="flex items-center justify-between rounded-xl border-2 border-os-border-strong bg-os-surface p-3">
        <div className="min-w-0 pr-3">
          <p className="text-[13px] text-os-ink">Enable notifications</p>
          <p className="mt-0.5 text-[10px] text-os-ink-soft">
            {enabled ? 'Notifications are enabled.' : 'Notifications are turned off.'}
          </p>
        </div>

        {/*
          Use a real checkbox rather than a button nested inside a label.
          The old structure could trigger the toggle twice because the button
          was interactive content inside a <label>. A native checkbox gives us
          reliable mouse + keyboard behavior and keeps the visual switch purely
          presentational.
        */}
        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
          <span className="sr-only">Enable notifications</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="peer sr-only"
          />

          <span
            aria-hidden="true"
            className={`relative h-7 w-12 rounded-[7px] border-2 border-os-border-strong shadow-[2px_2px_0_var(--os-shadow)] transition-colors duration-150 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-os-accent ${
              enabled ? 'bg-os-accent' : 'bg-os-surface-2'
            }`}
          >
            <span
              className={`absolute left-1 top-1 font-display text-[7px] leading-none transition-opacity duration-100 ${
                enabled ? 'opacity-0' : 'text-os-ink-soft opacity-100'
              }`}
            >
              OFF
            </span>
            <span
              className={`absolute right-1 top-1 font-display text-[7px] leading-none transition-opacity duration-100 ${
                enabled ? 'text-os-accent-ink opacity-100' : 'opacity-0'
              }`}
            >
              ON
            </span>

            <span
              className={`absolute left-0.5 top-0.5 h-[18px] w-[18px] rounded-[3px] border-2 border-os-border-strong bg-os-surface shadow-[1px_1px_0_var(--os-shadow)] transition-transform duration-150 ease-out ${
                enabled ? 'translate-x-[22px]' : 'translate-x-0'
              }`}
            />
          </span>
        </label>
      </div>

      <button
        type="button"
        disabled={!enabled}
        onClick={() =>
          notify({
            title: 'Test Notification',
            message: 'Notifications are working correctly.',
            icon: BellRing,
          })
        }
        className="flex items-center justify-center gap-2 rounded-lg border-2 border-os-border-strong bg-os-surface-2 py-2 text-[12px] text-os-ink transition-colors enabled:hover:bg-os-accent enabled:hover:text-os-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <BellRing size={14} /> Send test notification
      </button>
    </div>
  );
}
