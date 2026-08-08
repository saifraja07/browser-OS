import { useCallback, useEffect, useRef, useState } from 'react';
import { virtualFS } from '../../core/filesystem/virtualFS';
import { notify } from '../../store/useNotificationStore';
import { CONTACTS, randomReply } from './contacts';

const MESSAGES_PATH = '/System/messages.json';
let idCounter = 0;
const generateId = () => `msg_${Date.now()}_${idCounter++}`;

function createSeedThreads() {
  return Object.fromEntries(
    CONTACTS.map((contact) => [
      contact.id,
      (contact.initialMessages ?? []).map((message) => ({
        ...message,
        id: generateId(),
      })),
    ])
  );
}

export function useMessages() {
  const [threadsByContact, setThreadsByContact] = useState({});
  const [loading, setLoading] = useState(true);
  const threadsRef = useRef(threadsByContact);
  threadsRef.current = threadsByContact;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(await virtualFS.exists(MESSAGES_PATH))) {
        await virtualFS.mkdir('/System', { recursive: true });
        await virtualFS.writeFile(MESSAGES_PATH, JSON.stringify(createSeedThreads(), null, 2));
      }

      const raw = await virtualFS.readFile(MESSAGES_PATH);
      if (!cancelled) {
        try {
          const parsed = JSON.parse(raw);
          const seeded = createSeedThreads();
          // Add newly introduced contacts without destroying existing local threads.
          const merged = { ...seeded, ...parsed };
          setThreadsByContact(merged);
        } catch {
          setThreadsByContact(createSeedThreads());
        }
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next) => {
    setThreadsByContact(next);
    virtualFS.writeFile(MESSAGES_PATH, JSON.stringify(next, null, 2));
  }, []);

  const appendMessage = useCallback(
    (contactId, message) => {
      const next = {
        ...threadsRef.current,
        [contactId]: [...(threadsRef.current[contactId] ?? []), message],
      };
      persist(next);
    },
    [persist]
  );

  const sendMessage = useCallback(
    (contactId, text, contactName) => {
      appendMessage(contactId, { id: generateId(), from: 'me', text, ts: Date.now() });

      // The app is intentionally non-typing: a canned response arrives after a
      // short delay, keeping the interaction playful without a free-form chat box.
      const delay = 650 + Math.random() * 900;
      window.setTimeout(() => {
        appendMessage(contactId, {
          id: generateId(),
          from: 'them',
          text: randomReply(contactId),
          ts: Date.now(),
        });
        notify({ title: contactName, message: 'New message' });
      }, delay);
    },
    [appendMessage]
  );

  return { threadsByContact, loading, sendMessage };
}
