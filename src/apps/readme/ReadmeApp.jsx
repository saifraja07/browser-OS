import { useEffect, useState } from 'react';
import { virtualFS } from '../../core/filesystem/virtualFS';
import { parseMarkdown } from './markdown';
import { DEFAULT_README } from './defaultReadme';
import MarkdownView from './MarkdownView';

const README_PATH = '/System/README.md';

export default function ReadmeApp() {
  const [content, setContent] = useState(DEFAULT_README);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Keep the virtual README in sync with the built-in, read-only content.
        if (!(await virtualFS.exists('/System'))) {
          await virtualFS.mkdir('/System', { recursive: true });
        }

        const existing = await virtualFS.exists(README_PATH)
          ? await virtualFS.readFile(README_PATH)
          : null;

        if (existing !== DEFAULT_README) {
          await virtualFS.writeFile(README_PATH, DEFAULT_README);
        }
      } finally {
        if (!cancelled) {
          setContent(DEFAULT_README);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center font-mono text-xs text-os-ink-soft">
        loading…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center border-b-2 border-os-border px-3 py-1.5">
        <span className="font-display text-[10px] text-os-ink-soft">README.md</span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <MarkdownView blocks={parseMarkdown(content)} />
        </div>
      </div>
    </div>
  );
}
