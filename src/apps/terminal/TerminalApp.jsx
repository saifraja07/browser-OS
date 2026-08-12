import { useEffect, useRef, useState } from "react";
import { virtualFS } from "../../core/filesystem/virtualFS";
import { getAllApps } from "../../core/appRuntime/appRegistry";
import { useWindowStore } from "../../store/useWindowStore";
import { executeLine } from "./terminalEngine";

const WELCOME = [
  'BrowserOS Terminal — type "help" to see available commands.',
  "",
];

const USERNAME = "haadi@browserOS";

export default function TerminalApp() {
  // Real filesystem cwd.
  // This remains "/" internally.
  const [cwd, setCwd] = useState("/");

  const [lines, setLines] = useState(() =>
    WELCOME.map((text) => ({
      type: "output",
      text,
    })),
  );

  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(null);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const openApp = useWindowStore((s) => s.openApp);
  const closeApp = useWindowStore((s) => s.closeApp);

  /*
   * Keep terminal at the bottom when new output arrives.
   *
   * Also reset horizontal scrolling because mobile Chrome can
   * remember a horizontal position after focusing the input.
   */
  useEffect(() => {
    const terminal = scrollRef.current;

    if (!terminal) return;

    terminal.scrollLeft = 0;
    terminal.scrollTop = terminal.scrollHeight;
  }, [lines]);

  /*
   * Focus without letting mobile Chrome horizontally pan
   * the terminal when the keyboard opens.
   */
  const focusInput = () => {
    const input = inputRef.current;

    if (!input) return;

    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }

    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = 0;
      }
    });
  };

  const buildCtx = () => ({
    cwd,
    fs: virtualFS,
    setCwd,
    openApp,
    closeApp,
    listApps: getAllApps,
    clear: () => setLines([]),
  });

  // Visual path only.
  // The real filesystem path remains cwd.
  const displayPath = cwd === "/" ? "~" : `~${cwd}`;

  const runCommand = async (raw) => {
    setLines((prev) => [
      ...prev,
      {
        type: "input",
        command: raw,
        cwd,
      },
    ]);

    const { lines: output, isError } = await executeLine(raw, buildCtx());

    if (output.length > 0) {
      setLines((prev) => [
        ...prev,
        ...output.map((item) => {
          /*
           * help returns structured objects.
           * Keep them as help lines so the UI can render them
           * responsively instead of trying to render an object.
           */
          if (item && typeof item === "object" && item.type === "help") {
            return item;
          }

          return {
            type: isError ? "error" : "output",
            text: String(item),
          };
        }),
      ]);
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      const raw = input;

      setInput("");

      if (raw.trim()) {
        setCommandHistory((prev) => [...prev, raw]);
      }

      setHistoryIndex(null);

      await runCommand(raw);

      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      if (commandHistory.length === 0) return;

      const nextIndex =
        historyIndex === null
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);

      setHistoryIndex(nextIndex);
      setInput(commandHistory[nextIndex]);

      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();

      if (historyIndex === null) return;

      const nextIndex = historyIndex + 1;

      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    }
  };

  return (
    <div
      onClick={focusInput}
      className="
        flex
        h-full
        w-full
        min-w-0
        max-w-full
        flex-col
        overflow-hidden
        bg-[#161320]
        p-3
        font-mono
        text-[13px]
      "
    >
      <div
        ref={scrollRef}
        className="
          min-h-0
          min-w-0
          w-full
          max-w-full
          flex-1
          overflow-x-hidden
          overflow-y-auto
          overscroll-x-none
        "
      >
        {lines.map((line, i) => {
          if (line.type === "help") {
            return (
              <div
                key={i}
                className="
        flex
        min-w-0
        max-w-full
        items-start
      "
              >
                <span
                  className="
          w-32
          shrink-0
          whitespace-nowrap
          text-os-mint
        "
                >
                  {line.usage}
                </span>

                <span
                  className="
          min-w-0
          flex-1
          whitespace-pre-wrap
          wrap-break-word
          text-[#d8d5df]
        "
                >
                  {line.description}
                </span>
              </div>
            );
          }

          /*
           * --------------------------------
           * Command entered by user
           * --------------------------------
           */
          if (line.type === "input") {
            const path = line.cwd === "/" ? "~" : `~${line.cwd}`;

            return (
              <div
                key={i}
                className="
                  flex
                  min-w-0
                  max-w-full
                  flex-wrap
                  whitespace-pre-wrap
                  wrap-break-word
                "
              >
                <span className="shrink-0 text-os-mint">{USERNAME}</span>

                <span className="shrink-0 text-[#f2c14e]">:{path}$</span>

                {line.command && (
                  <span
                    className="
                      ml-2
                      min-w-0
                      max-w-full
                      wrap-break-word
                      whitespace-pre-wrap
                      text-[#f4f1de]
                    "
                  >
                    {line.command}
                  </span>
                )}
              </div>
            );
          }

          /*
           * --------------------------------
           * Errors
           * --------------------------------
           */
          if (line.type === "error") {
            return (
              <div
                key={i}
                className="
                  min-w-0
                  max-w-full
                  whitespace-pre-wrap
                  wrap-break-word
                  text-[#ff6b6b]
                "
              >
                {line.text}
              </div>
            );
          }

          /*
           * --------------------------------
           * Normal output
           * --------------------------------
           */
          return (
            <div
              key={i}
              className="
                min-w-0
                max-w-full
                whitespace-pre-wrap
                wrap-break-word
                text-[#d8d5df]
              "
            >
              {line.text}
            </div>
          );
        })}

        {/* Current command prompt */}
        <div
          className="
            flex
            min-w-0
            max-w-full
            items-center
          "
        >
          <span className="shrink-0 text-os-mint">{USERNAME}</span>

          <span className="shrink-0 text-[#f2c14e]">:{displayPath}$</span>

          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              requestAnimationFrame(() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollLeft = 0;
                }
              });
            }}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            enterKeyHint="enter"
            className="
              ml-2
              min-w-0
              w-0
              max-w-full
              flex-1
              bg-transparent
              text-[#f4f1de]
              caret-[#f2c14e]
              outline-none
            "
          />
        </div>
      </div>
    </div>
  );
}
