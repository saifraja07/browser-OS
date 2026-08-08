import { useEffect, useRef, useState } from 'react';
import { Palette, BellRing, HardDrive } from 'lucide-react';
import AppearanceSection from './sections/AppearanceSection';
import NotificationsSection from './sections/NotificationsSection';
import StorageSection from './sections/StorageSection';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette, Component: AppearanceSection },
  { id: 'notifications', label: 'Notifications', icon: BellRing, Component: NotificationsSection },
  { id: 'storage', label: 'Storage', icon: HardDrive, Component: StorageSection },
];

// Below this window width, the fixed 144px label sidebar leaves too little
// room for section content (theme grid, stat cards, etc). Switch to a
// compact icon-only top strip instead — same sections, same behavior, just
// laid out to fit. Measured against the window itself (not the viewport),
// since Settings can be this narrow on desktop too if resized down.
const COMPACT_WIDTH_THRESHOLD = 360;

export default function SettingsApp() {
  const [activeId, setActiveId] = useState('appearance');
  const [isCompact, setIsCompact] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setIsCompact(width < COMPACT_WIDTH_THRESHOLD);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];
  const ActiveComponent = active.Component;

  return (
    <div ref={containerRef} className={`flex h-full ${isCompact ? 'flex-col' : ''}`}>
      <nav
        className={
          isCompact
            ? 'flex shrink-0 items-center justify-around gap-1 border-b-2 border-os-border bg-os-surface-2 p-1.5'
            : 'flex w-36 shrink-0 flex-col gap-1 border-r-2 border-os-border bg-os-surface-2 p-2'
        }
      >
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = section.id === activeId;
          return (
            <button
              key={section.id}
              onClick={() => setActiveId(section.id)}
              aria-label={section.label}
              aria-current={isActive ? 'true' : undefined}
              className={
                isCompact
                  ? `flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[8px] ${
                      isActive ? 'bg-os-accent text-os-accent-ink' : 'text-os-ink hover:bg-os-surface'
                    }`
                  : `flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] ${
                      isActive ? 'bg-os-accent text-os-accent-ink' : 'text-os-ink hover:bg-os-surface'
                    }`
              }
            >
              <Icon size={isCompact ? 16 : 14} />
              <span className={isCompact ? 'truncate' : ''}>{section.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1 overflow-auto p-4">
        <ActiveComponent />
      </div>
    </div>
  );
}
