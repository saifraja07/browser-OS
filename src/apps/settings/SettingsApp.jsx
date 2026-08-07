import { useState } from 'react';
import { Palette, BellRing, HardDrive } from 'lucide-react';
import AppearanceSection from './sections/AppearanceSection';
import NotificationsSection from './sections/NotificationsSection';
import StorageSection from './sections/StorageSection';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette, Component: AppearanceSection },
  { id: 'notifications', label: 'Notifications', icon: BellRing, Component: NotificationsSection },
  { id: 'storage', label: 'Storage', icon: HardDrive, Component: StorageSection },
];

export default function SettingsApp() {
  const [activeId, setActiveId] = useState('appearance');
  const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];
  const ActiveComponent = active.Component;

  return (
    <div className="flex h-full">
      <nav className="flex w-36 shrink-0 flex-col gap-1 border-r-2 border-os-border bg-os-surface-2 p-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = section.id === activeId;
          return (
            <button
              key={section.id}
              onClick={() => setActiveId(section.id)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] ${
                isActive ? 'bg-os-accent text-os-accent-ink' : 'text-os-ink hover:bg-os-surface'
              }`}
            >
              <Icon size={14} />
              {section.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 overflow-auto p-4">
        <ActiveComponent />
      </div>
    </div>
  );
}
