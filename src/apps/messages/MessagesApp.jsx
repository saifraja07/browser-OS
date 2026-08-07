import { useState } from 'react';
import { CONTACTS } from './contacts';
import { useMessages } from './useMessages';
import ContactList from './ContactList';
import ThreadView from './ThreadView';

export default function MessagesApp() {
  const [selectedId, setSelectedId] = useState(CONTACTS[0].id);
  const { threadsByContact, loading, typingContactId, sendMessage } = useMessages();

  const contact = CONTACTS.find((c) => c.id === selectedId);
  const messages = threadsByContact[selectedId] ?? [];

  if (loading) {
    return <div className="flex h-full items-center justify-center font-mono text-xs text-os-ink-soft">loading…</div>;
  }

  return (
    <div className="flex h-full">
      <ContactList
        contacts={CONTACTS}
        threadsByContact={threadsByContact}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <ThreadView
        contact={contact}
        messages={messages}
        isTyping={typingContactId === selectedId}
        onSend={(text) => sendMessage(selectedId, text, contact.name)}
      />
    </div>
  );
}
