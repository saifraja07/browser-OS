import { useEffect, useState } from 'react';
import { virtualFS } from '../../core/filesystem/virtualFS';
import DEFAULT_README from './defaultReadme.txt?raw';

const README_PATH = '/System/README.txt';
const LEGACY_README_PATH = '/System/README.md';

export default function ReadmeApp() {
  const [content, setContent] = useState(DEFAULT_README);

  useEffect(() => {
    async function loadReadme() {
      if (!(await virtualFS.exists('/System'))) {
        await virtualFS.mkdir('/System', { recursive: true });
      }

      if (await virtualFS.exists(LEGACY_README_PATH)) {
        await virtualFS.delete(LEGACY_README_PATH);
      }

      if (await virtualFS.exists(README_PATH)) {
        setContent(await virtualFS.readFile(README_PATH));
      } else {
        await virtualFS.writeFile(README_PATH, DEFAULT_README, {
          mimeType: 'text/plain',
        });
      }
    }

    loadReadme();
  }, []);

  return (
    <div className="h-full overflow-auto bg-[#f5f2e8] p-4">
      <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[11px] leading-[1.6] text-black">
        {content}
      </pre>
    </div>
  );
}