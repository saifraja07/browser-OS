import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

function formatDate(contact) {
  if (contact.dateLabel) return contact.dateLabel;
  return '';
}

export default function ContactList({ contacts, threadsByContact, selectedId, onSelect }) {
  const [query, setQuery] = useState('');
  const filteredContacts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return contacts;
    return contacts.filter((contact) =>
      `${contact.name} ${contact.tagline}`.toLowerCase().includes(normalized)
    );
  }, [contacts, query]);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-os-surface text-os-ink">
      <div className="border-b-2 border-os-border bg-os-surface-2 p-2">
        <label className="flex h-8 items-center gap-2 rounded-full border-2 border-os-border-strong bg-white/70 px-3 shadow-[0_2px_0_rgba(0,0,0,.08)] focus-within:bg-white">
          <Search size={14} strokeWidth={2.5} className="shrink-0 text-os-ink" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search conversations"
            className="min-w-0 flex-1 bg-transparent font-mono text-[11px] text-os-ink outline-none placeholder:text-os-ink-soft"
          />
        </label>
      </div>

      <div className="border-b border-os-border bg-os-surface px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-os-ink-soft">
        {filteredContacts.length} conversations
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-os-surface">
        {filteredContacts.map((contact) => {
          const thread = threadsByContact[contact.id] ?? [];
          const lastMessage = thread[thread.length - 1];
          const isSelected = selectedId === contact.id;
          return (
            <button
              key={contact.id}
              onClick={() => onSelect(contact.id)}
              className={`group flex w-full items-center gap-3 border-b border-os-border px-3 py-2.5 text-left transition-colors ${
                isSelected ? 'bg-os-surface-2' : 'hover:bg-os-surface-2/70'
              }`}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-os-border-strong bg-white text-[20px] shadow-[0_2px_0_rgba(0,0,0,.08)]"
                style={{ backgroundColor: `${contact.color}33` }}
                aria-hidden="true"
              >
                {contact.avatar}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-display text-[11px] text-os-ink">{contact.name}</span>
                  <span className="shrink-0 font-mono text-[8px] text-os-ink-soft">{formatDate(contact)}</span>
                </span>
                <span className="mt-1 block truncate font-mono text-[9px] text-os-ink-soft">
                  {lastMessage?.text ?? contact.tagline}
                </span>
              </span>
            </button>
          );
        })}

        {filteredContacts.length === 0 && (
          <div className="p-5 text-center font-mono text-[10px] text-os-ink-soft">No conversations found.</div>
        )}
      </div>
    </div>
  );
}
