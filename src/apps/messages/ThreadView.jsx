import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function ThreadView({ contact, messages, isTyping, onSend }) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft('');
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b-2 border-os-border px-3 py-2">
        <span className="font-display text-[11px] text-os-ink">{contact.name}</span>
        <span className="ml-2 text-[10px] text-os-ink-soft">{contact.tagline}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-3">
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-1.5 text-[13px] ${
                    m.from === 'me'
                      ? 'rounded-br-sm bg-os-accent text-os-accent-ink'
                      : 'rounded-bl-sm bg-os-surface-2 text-os-ink'
                  }`}
                >
                  {m.text}
                  <div className={`mt-0.5 text-[9px] ${m.from === 'me' ? 'opacity-70' : 'text-os-ink-soft'}`}>
                    {formatTime(m.ts)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-os-surface-2 px-3 py-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-os-ink-soft"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <form onSubmit={submit} className="flex items-center gap-1.5 border-t-2 border-os-border p-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message ${contact.name}…`}
          className="min-w-0 flex-1 rounded-lg border-2 border-os-border bg-os-surface px-2.5 py-1.5 text-[12px] text-os-ink outline-none focus:border-os-accent"
        />
        <button
          type="submit"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-os-border-strong bg-os-accent text-os-accent-ink hover:-translate-y-0.5"
          aria-label="Send"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
