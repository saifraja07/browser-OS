import { useEffect, useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { virtualFS } from '../../../core/filesystem/virtualFS';
import { notify } from '../../../store/useNotificationStore';

function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StorageSection() {
  const [stats, setStats] = useState(null);
  const [armed, setArmed] = useState(false);

  const load = () => virtualFS.getStats().then(setStats);

  useEffect(() => {
    load();
    const unsubscribe = virtualFS.subscribe(load);
    return unsubscribe;
  }, []);

  const handleResetClick = async () => {
    if (!armed) {
      setArmed(true);
      setTimeout(() => setArmed(false), 4000); // auto-disarm if they don't confirm
      return;
    }
    await virtualFS.reset();
    setArmed(false);
    notify({ title: 'Filesystem reset', message: 'All files and folders were removed.' });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-[11px] text-os-ink">Storage</h3>
        <p className="mt-1 text-[12px] text-os-ink-soft">Everything is stored locally in this browser.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Files" value={stats.fileCount} />
          <StatCard label="Folders" value={stats.folderCount} />
          <StatCard label="Used" value={fmtBytes(stats.totalBytes)} />
        </div>
      )}

      <button
        onClick={handleResetClick}
        className={`flex items-center justify-center gap-2 rounded-lg border-2 py-2 text-[12px] transition-colors ${
          armed
            ? 'border-os-danger bg-os-danger text-os-surface'
            : 'border-os-border-strong bg-os-surface-2 text-os-ink hover:bg-os-danger hover:text-os-surface'
        }`}
      >
        {armed ? <AlertTriangle size={14} /> : <Trash2 size={14} />}
        {armed ? 'Click again to confirm — this cannot be undone' : 'Reset filesystem'}
      </button>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border-2 border-os-border-strong p-3 text-center">
      <div className="font-display text-sm text-os-ink">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-os-ink-soft">{label}</div>
    </div>
  );
}
