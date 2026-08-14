import { useEffect, useRef, useState } from "react";

/**
 * First-paint layer: a brief retro startup screen shown on every page load,
 * before the login/unlock screen. Purely cosmetic — nothing is actually
 * loading here, it just paces the BrowserOS "startup" beat with a fake,
 * typed-out system-check sequence (title -> checklist -> progress -> ready).
 *
 * Every line types itself out character-by-character in place (no slide/
 * fade motion) and lines appear top-to-bottom in order. The whole sequence
 * is one sequential async routine rather than a flat table of absolute
 * timestamps, because typing speed naturally depends on each line's length
 * — a fixed timeline would either rush long lines or crawl through short
 * ones. `cancelledRef` + `timeoutsRef` let the routine bail out cleanly and
 * clear any pending timers if the component unmounts mid-sequence.
 */

const CHECK_ITEMS = [
  "Virtual Memory",
  "File System",
  "Desktop Environment",
  "Applications",
  "User Session",
];

const CHECKING_TEXT = "Checking system configuration\u2026";
const INITIALIZING_TEXT = "Initializing\u2026";
const READY_TEXT = "SYSTEM READY";

const MS_PER_CHAR = 11; // typing speed
const TITLE_WAIT = 200; // pause after the title fades in before typing starts
const LINE_GAP = 100; // pause after a line finishes typing before the next starts
const ITEM_CHECKING_HOLD = 60; // "[~]" hold before flipping to "[✓]"
const ITEM_DONE_HOLD = 80; // "[✓]" hold before the next item starts
const PROGRESS_DURATION = 600; // 0% -> 100%
const READY_HOLD = 350; // SYSTEM READY stays up before exiting
const EXIT_DURATION = 260;

const MARK_LEN = 3; // "[ ]" / "[~]" / "[✓]"

function markCharFor(status) {
  if (status === "done") return "\u2713";
  if (status === "checking") return "~";
  return " ";
}

function markColorFor(status) {
  if (status === "done") return "text-os-border-strong";
  if (status === "checking") return "text-os-accent";
  return "text-os-ink-soft";
}

export default function BootScreen({ onFinish }) {
  // Ref so the routine (started once) always calls the latest onFinish
  // without needing to be an effect dependency.
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const [checkingRevealed, setCheckingRevealed] = useState(0);
  const [itemStatus, setItemStatus] = useState(() =>
    CHECK_ITEMS.map(() => "hidden"),
  );
  const [itemRevealed, setItemRevealed] = useState(() =>
    CHECK_ITEMS.map(() => 0),
  );
  const [initRevealed, setInitRevealed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [readyRevealed, setReadyRevealed] = useState(0);
  const [typingKey, setTypingKey] = useState(null); // which line currently shows the caret
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const cancelledRef = { current: false };
    const timeoutsRef = { current: [] };

    const wait = (ms) =>
      new Promise((resolve) => {
        const id = setTimeout(resolve, ms);
        timeoutsRef.current.push(id);
      });

    // Reveals `length` characters one at a time via `onTick(count)`,
    // roughly MS_PER_CHAR apart. Resolves once fully typed (or immediately
    // if the effect was cleaned up mid-sequence).
    const typeInto = async (key, onTick, length) => {
      setTypingKey(key);
      for (let i = 1; i <= length; i += 1) {
        await wait(MS_PER_CHAR);
        if (cancelledRef.current) return;
        onTick(i);
      }
      if (!cancelledRef.current) setTypingKey(null);
    };

    const setItem = (index, status) => {
      setItemStatus((prev) => prev.map((v, i) => (i === index ? status : v)));
    };
    const setItemChars = (index, count) => {
      setItemRevealed((prev) => prev.map((v, i) => (i === index ? count : v)));
    };

    (async () => {
      await wait(TITLE_WAIT);
      if (cancelledRef.current) return;

      await typeInto("checking", setCheckingRevealed, CHECKING_TEXT.length);
      if (cancelledRef.current) return;
      await wait(LINE_GAP);

      for (let i = 0; i < CHECK_ITEMS.length; i += 1) {
        if (cancelledRef.current) return;
        const fullLength = MARK_LEN + 1 + CHECK_ITEMS[i].length; // "[ ] " + label
        setItem(i, "pending");
        await typeInto(
          `item-${i}`,
          (count) => setItemChars(i, count),
          fullLength,
        );
        if (cancelledRef.current) return;
        await wait(ITEM_CHECKING_HOLD);
        setItem(i, "checking");
        await wait(ITEM_CHECKING_HOLD);
        if (cancelledRef.current) return;
        setItem(i, "done");
        await wait(ITEM_DONE_HOLD);
      }
      if (cancelledRef.current) return;
      await wait(LINE_GAP);

      await typeInto("init", setInitRevealed, INITIALIZING_TEXT.length);
      if (cancelledRef.current) return;
      await wait(LINE_GAP);

      setProgress(100);
      await wait(PROGRESS_DURATION);
      if (cancelledRef.current) return;
      await wait(LINE_GAP);

      await typeInto("ready", setReadyRevealed, READY_TEXT.length);
      if (cancelledRef.current) return;
      await wait(READY_HOLD);

      setExiting(true);
      await wait(EXIT_DURATION);
      if (cancelledRef.current) return;
      onFinishRef.current?.();
    })();

    return () => {
      cancelledRef.current = true;
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-(--z-boot) flex items-center justify-center bg-linear-to-br from-os-bg to-os-bg-2 px-4 transition-opacity ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        transitionDuration: `${EXIT_DURATION}ms`,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="pixel-cut flex w-[calc(100vw-32px)] max-w-75 flex-col items-center gap-3 border-[3px] border-os-border-strong bg-os-surface px-5 py-6 shadow-os-window sm:max-w-[320px] sm:px-6 sm:py-7">
        <div className="os-line-in flex flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden border-os-border-strong bg-os-surface">
            <img
              src="/favicon.ico"
              alt="BrowserOS"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="font-display text-sm tracking-(--os-display-tracking) text-os-ink">
            BrowserOS
          </p>
        </div>

        <div className="flex min-h-37 w-full flex-col justify-start gap-1 font-mono text-[10.5px] sm:text-[11px]">
          <p className="text-os-ink-soft">
            {CHECKING_TEXT.slice(0, checkingRevealed)}
            {typingKey === "checking" && <span className="os-caret" />}
          </p>

          {CHECK_ITEMS.map((label, i) => {
            const status = itemStatus[i];
            if (status === "hidden") return null;

            const revealed = itemRevealed[i];
            const markStr = `[${markCharFor(status)}]`;
            const markVisible = markStr.slice(0, Math.min(revealed, MARK_LEN));
            const sepVisible = revealed > MARK_LEN ? " " : "";
            const labelVisible =
              revealed > MARK_LEN + 1
                ? label.slice(0, revealed - MARK_LEN - 1)
                : "";

            return (
              <p key={label} className="flex items-center">
                <span className={`font-display ${markColorFor(status)}`}>
                  {markVisible}
                </span>
                <span className="text-os-ink">
                  {sepVisible}
                  {labelVisible}
                </span>
                {typingKey === `item-${i}` && <span className="os-caret" />}
              </p>
            );
          })}

          <p className="mt-1 text-os-ink-soft">
            {INITIALIZING_TEXT.slice(0, initRevealed)}
            {typingKey === "init" && <span className="os-caret" />}
          </p>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-(--os-radius-sm) border-2 border-os-border bg-os-surface-2">
          <div
            className="h-full rounded-(--os-radius-sm) bg-os-accent transition-[width]"
            style={{
              width: `${progress}%`,
              transitionDuration: `${PROGRESS_DURATION}ms`,
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>

        <p className="font-display text-[11px] tracking-(--os-display-tracking) text-os-border-strong">
          {READY_TEXT.slice(0, readyRevealed)}
          {typingKey === "ready" && readyRevealed > 0 && (
            <span className="os-caret" />
          )}
        </p>
      </div>
    </div>
  );
}
