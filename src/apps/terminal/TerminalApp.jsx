import { useEffect, useRef, useState } from 'react';
import { virtualFS } from '../../core/filesystem/virtualFS';
import { getAllApps } from '../../core/appRuntime/appRegistry';
import { useWindowStore } from '../../store/useWindowStore';
import { executeLine } from './terminalEngine';

const WELCOME = [
  'BrowserOS Terminal — type "help" to see available commands.',
  '',
];

export default function TerminalApp() {
  const [cwd, setCwd] = useState('/');
  const [lines, setLines] = useState(() => WELCOME.map((text) => ({ type: 'output', text })));
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(null);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const openApp = useWindowStore((s) => s.openApp);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const focusInput = () => inputRef.current?.focus();

  const buildCtx = () => ({
    cwd,
    fs: virtualFS,
    setCwd,
    openApp,
    listApps: getAllApps,
    clear: () => setLines([]),
  });

  const runCommand = async (raw) => {
    const prompt = `${cwd} $ ${raw}`;
    setLines((prev) => [...prev, { type: 'input', text: prompt }]);

    const { lines: output, isError } = await executeLine(raw, buildCtx());
    if (output.length > 0) {
      setLines((prev) => [
        ...prev,
        ...output.map((text) => ({ type: isError ? 'error' : 'output', text })),
      ]);
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      const raw = input;
      setInput('');
      if (raw.trim()) {
        setCommandHistory((prev) => [...prev, raw]);
      }
      setHistoryIndex(null);
      await runCommand(raw);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === null ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(commandHistory[nextIndex]);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(null);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    }
  };

  return (
    <div
      onClick={focusInput}
      className="flex h-full flex-col bg-[#161320] p-3 font-mono text-[13px] text-[#e8e4f5]"
    >
      <div ref={scrollRef} className="flex-1 overflow-auto">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap ${
              line.type === 'input'
                ? 'text-[rgb(111,207,151)]'
                : line.type === 'error'
                  ? 'text-[#ff6b8b]'
                  : 'text-[#e8e4f5]/90'
            }`}
          >
            {line.text}
          </div>
        ))}

        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[rgb(111,207,151)]">{cwd} $</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="flex-1 bg-transparent text-[#e8e4f5] outline-none"
          />
        </div>
      </div>
    </div>
  );
}
