import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { getConversationStep } from "./contacts";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(ts) {
  return new Date(ts)
    .toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();
}

export default function ThreadView({
  contact,
  messages,
  progress,
  pending,
  onSend,
  onBack,
}) {
  const scrollRef = useRef(null);

  const currentStep = getConversationStep(contact.id, progress);
  const conversationEnded =
    !currentStep || progress >= contact.conversation.length;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-os-surface text-os-ink">
      {/* Header */}
      <div className="relative shrink-0 border-b-2 border-os-border bg-os-surface-2 px-3 py-2 text-center">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center border-2 border-os-border-strong bg-os-surface font-bold shadow-[0_2px_0_rgba(0,0,0,.15)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <ArrowLeft size={13} />
        </button>

        <div className="mx-auto flex w-fit flex-col items-center">
          <span
            className="mb-1 flex h-12 w-12 items-center justify-center rounded-full border-2 border-os-border-strong bg-white text-[25px] shadow-[0_2px_0_rgba(0,0,0,.1)]"
            style={{ backgroundColor: `${contact.color}33` }}
            aria-hidden="true"
          >
            {contact.avatar}
          </span>

          <span className="font-display text-[11px] text-os-ink">
            {contact.name}
          </span>

          <span className="font-mono text-[8px] text-os-ink-soft">
            {contact.tagline}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const previous = messages[index - 1];

              const showDay =
                !previous || formatDay(previous.ts) !== formatDay(message.ts);

              return (
                <div key={message.id}>
                  {showDay && (
                    <div className="mb-2 mt-1 text-center font-mono text-[8px] font-bold tracking-widest text-os-ink-soft">
                      {formatDay(message.ts)} @ {formatTime(message.ts)}
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${
                      message.from === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[82%] rounded-[14px] border-2 border-os-border-strong px-3 py-2 font-mono text-[10px] leading-[1.45] shadow-[0_2px_0_rgba(0,0,0,.08)] ${
                        message.from === "me"
                          ? "rounded-br-sm bg-os-accent text-os-accent-ink"
                          : "rounded-bl-sm bg-os-surface-2 text-os-ink"
                      }`}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>

          {pending && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="rounded-[14px] rounded-bl-sm border-2 border-os-border-strong bg-os-surface-2 px-3 py-2 font-mono text-[10px] text-os-ink-soft shadow-[0_2px_0_rgba(0,0,0,.08)]">
                …
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Reply box - always stays at bottom */}
      <div className="shrink-0 border-t-2 border-os-border bg-os-surface-2 p-2">
        {conversationEnded ? (
          <div className="flex h-9 items-center justify-center rounded-full border-2 border-os-border-strong bg-os-surface px-3 font-mono text-[9px] uppercase tracking-[0.12em] text-os-ink-soft">
            Conversation ended
          </div>
        ) : (
          <>
            <div className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-os-ink-soft">
              {pending ? "Waiting for a reply…" : "Choose a reply"}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {currentStep.options.map((option, index) => (
                <button
                  key={`${progress}-${option.text}`}
                  type="button"
                  disabled={pending}
                  onClick={() => onSend(index)}
                  className="min-w-0 rounded-xl border-2 border-os-border-strong bg-os-surface px-2.5 py-2 text-left font-mono text-[9px] leading-[1.35] text-os-ink shadow-[0_2px_0_rgba(0,0,0,.1)] transition-all hover:-translate-y-0.5 hover:bg-os-accent hover:text-os-accent-ink active:translate-y-0 disabled:cursor-wait disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-os-surface disabled:hover:text-os-ink"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
