import { useEffect, useState } from 'react';
import { Pencil, Eye, Save } from 'lucide-react';
import { virtualFS } from '../../core/filesystem/virtualFS';
import { notify } from '../../store/useNotificationStore';
import { parseMarkdown } from './markdown';
import { DEFAULT_README } from './defaultReadme';
import MarkdownView from './MarkdownView';

const README_PATH = '/System/README.md';

export default function ReadmeApp() {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState('read'); // 'read' | 'edit'
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(await virtualFS.exists(README_PATH))) {
        await virtualFS.mkdir('/System', { recursive: true });
        await virtualFS.writeFile(README_PATH, DEFAULT_README);
      }
      const text = await virtualFS.readFile(README_PATH);
      if (!cancelled) {
        setContent(text);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    await virtualFS.writeFile(README_PATH, content);
    setDirty(false);
    notify({ title: 'Saved', message: 'README.md' });
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center font-mono text-xs text-os-ink-soft">loading…</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b-2 border-os-border px-3 py-1.5">
        <span className="font-display text-[10px] text-os-ink-soft">README.md</span>
        <div className="flex items-center gap-1.5">
          {mode === 'edit' && (
            <button
              onClick={save}
              disabled={!dirty}
              className="flex items-center gap-1 rounded-md border-2 border-os-border-strong bg-os-mint px-2 py-0.5 text-[11px] text-os-accent-ink enabled:hover:-translate-y-0.5 disabled:opacity-40"
            >
              <Save size={12} /> Save
            </button>
          )}
          <button
            onClick={() => setMode((m) => (m === 'read' ? 'edit' : 'read'))}
            className="flex items-center gap-1 rounded-md border-2 border-os-border-strong bg-os-surface-2 px-2 py-0.5 text-[11px] text-os-ink hover:-translate-y-0.5"
          >
            {mode === 'read' ? (
              <>
                <Pencil size={12} /> Edit
              </>
            ) : (
              <>
                <Eye size={12} /> Preview
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {mode === 'read' ? (
          <div className="p-4">
            <MarkdownView blocks={parseMarkdown(content)} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setDirty(true);
            }}
            spellCheck={false}
            className="h-full w-full resize-none bg-os-surface p-3 font-mono text-[13px] text-os-ink outline-none"
          />
        )}
      </div>
    </div>
  );
}
