import { splitPath } from '../../core/filesystem/pathUtils';

export default function Breadcrumb({ path, onNavigate }) {
  const segments = splitPath(path);

  return (
    <div className="flex min-w-0 items-center gap-1 overflow-x-auto font-mono text-[12px] text-os-ink-soft">
      <button
        onClick={() => onNavigate('/')}
        className="shrink-0 rounded px-1.5 py-0.5 hover:bg-os-surface-2 hover:text-os-ink"
      >
        Home
      </button>
      {segments.map((segment, i) => {
        const segPath = '/' + segments.slice(0, i + 1).join('/');
        return (
          <span key={segPath} className="flex shrink-0 items-center gap-1">
            <span className="text-os-ink-soft/50">/</span>
            <button
              onClick={() => onNavigate(segPath)}
              className="rounded px-1.5 py-0.5 hover:bg-os-surface-2 hover:text-os-ink"
            >
              {segment}
            </button>
          </span>
        );
      })}
    </div>
  );
}
