import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { virtualFS } from '../../core/filesystem/virtualFS';
import { notify } from '../../store/useNotificationStore';

export default function TextEditorPane({ path, name, onClose, onSaved }) {
  const [content, setContent] = useState('');
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    virtualFS.readFile(path).then((text) => {
      if (!cancelled) {
        setContent(text);
        setDirty(false);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  const save = async () => {
    await virtualFS.writeFile(path, content);
    setDirty(false);
    notify({ title: 'Saved', message: name });
    onSaved?.(content);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b-2 border-os-border px-2 py-1.5">
        <button
          onClick={onClose}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[12px] text-os-ink-soft hover:bg-os-surface-2 hover:text-os-ink"
        >
          <ArrowLeft size={13} /> Back
        </button>
        <span className="flex-1 truncate font-mono text-[12px] text-os-ink">{name}</span>
        <button
          onClick={save}
          disabled={!dirty}
          className="flex items-center gap-1 rounded-md border-2 border-os-border-strong bg-os-mint px-2 py-0.5 text-[11px] text-os-accent-ink enabled:hover:-translate-y-0.5 disabled:opacity-40"
        >
          <Save size={12} /> Save
        </button>
      </div>
      {loading ? (
        <div className="flex flex-1 items-center justify-center font-mono text-xs text-os-ink-soft">
          loading…
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setDirty(true);
          }}
          spellCheck={false}
          className="flex-1 resize-none bg-os-surface p-3 font-mono text-[13px] text-os-ink outline-none"
        />
      )}
    </div>
  );
}
