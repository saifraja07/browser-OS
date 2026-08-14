import { useState } from 'react';
import { CONTACTS } from './contacts';
import { useMessages } from './useMessages';
import ContactList from './ContactList';
import ThreadView from './ThreadView';

export default function MessagesApp() {
  const [selectedId, setSelectedId] = useState(null);

  const {
    threadsByContact,
    progressByContact,
    pendingContactId,
    loading,
    sendMessage,
  } = useMessages();

  const contact = CONTACTS.find((item) => item.id === selectedId);
  const messages = selectedId ? threadsByContact[selectedId] ?? [] : [];
  const progress = selectedId ? progressByContact[selectedId] ?? null : null;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center font-mono text-xs text-os-ink-soft">
        loading…
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex h-full flex-col">
        <ContactList
          contacts={CONTACTS}
          threadsByContact={threadsByContact}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    );
  }

  return (
    <ThreadView
      contact={contact}
      messages={messages}
      progress={progress}
      pending={pendingContactId === selectedId}
      onBack={() => setSelectedId(null)}
      onSend={(optionIndex) =>
        sendMessage(selectedId, optionIndex, contact.name)
      }
    />
  );
}
