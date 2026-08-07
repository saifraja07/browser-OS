function initials(name) {
  return name.slice(0, 2).toUpperCase();
}

export default function ContactList({ contacts, threadsByContact, selectedId, onSelect }) {
  return (
    <div className="flex w-32 shrink-0 flex-col gap-1 overflow-auto border-r-2 border-os-border bg-os-surface-2 p-1.5">
      {contacts.map((contact) => {
        const thread = threadsByContact[contact.id] ?? [];
        const lastMessage = thread[thread.length - 1];
        const isSelected = selectedId === contact.id;
        return (
          <button
            key={contact.id}
            onClick={() => onSelect(contact.id)}
            className={`flex flex-col items-start gap-1 rounded-lg p-2 text-left ${
              isSelected ? 'bg-os-accent text-os-accent-ink' : 'text-os-ink hover:bg-os-surface'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[8px] text-white"
                style={{ backgroundColor: contact.color }}
              >
                {initials(contact.name)}
              </span>
              <span className="truncate text-[12px] font-medium">{contact.name}</span>
            </div>
            <span className={`truncate text-[10px] ${isSelected ? 'opacity-90' : 'text-os-ink-soft'}`}>
              {lastMessage ? lastMessage.text : contact.tagline}
            </span>
          </button>
        );
      })}
    </div>
  );
}
