import { useEffect, useRef, useState } from 'react';
import { iconForEntry } from './fileIcons';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileRow({
  entry,
  isSelected,
  isRenaming,
  onOpen,
  onContextMenu,
  onRenameCommit,
  onRenameCancel,
}) {
  const Icon = iconForEntry(entry);
  const [draftName, setDraftName] = useState(entry.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isRenaming) {
      setDraftName(entry.name);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isRenaming, entry.name]);

  const commit = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== entry.name) onRenameCommit(trimmed);
    else onRenameCancel();
  };

  return (
    <div
      onClick={() => !isRenaming && onOpen(entry)}
      onContextMenu={(e) => onContextMenu(e, entry)}
      className={`flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] ${
        isSelected ? 'bg-os-accent text-os-accent-ink' : 'text-os-ink hover:bg-os-surface-2'
      }`}
    >
      <Icon size={16} className="shrink-0" />
      {isRenaming ? (
        <input
          ref={inputRef}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') onRenameCancel();
          }}
          onBlur={commit}
          className="min-w-0 flex-1 rounded border border-os-border bg-os-surface px-1 py-0.5 text-os-ink outline-none"
        />
      ) : (
        <span className="min-w-0 flex-1 truncate">{entry.name}</span>
      )}
      {entry.type === 'file' && !isRenaming && (
        <span className="shrink-0 text-[11px] opacity-70">{formatSize(entry.size)}</span>
      )}
    </div>
  );
}
