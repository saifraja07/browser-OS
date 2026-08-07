import { useCallback, useEffect, useRef, useState } from 'react';
import { virtualFS } from '../../core/filesystem/virtualFS';
import { notify } from '../../store/useNotificationStore';
import { randomReply } from './contacts';

const MESSAGES_PATH = '/System/messages.json';
let idCounter = 0;
const generateId = () => `msg_${Date.now()}_${idCounter++}`;

export function useMessages() {
  const [threadsByContact, setThreadsByContact] = useState({});
  const [loading, setLoading] = useState(true);
  const [typingContactId, setTypingContactId] = useState(null);
  const threadsRef = useRef(threadsByContact);
  threadsRef.current = threadsByContact;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(await virtualFS.exists(MESSAGES_PATH))) {
        await virtualFS.mkdir('/System', { recursive: true });
        await virtualFS.writeFile(MESSAGES_PATH, '{}');
      }
      const raw = await virtualFS.readFile(MESSAGES_PATH);
      if (!cancelled) {
        try {
          setThreadsByContact(JSON.parse(raw));
        } catch {
          setThreadsByContact({});
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

      setTypingContactId(contactId);
      const delay = 900 + Math.random() * 1200;
      setTimeout(() => {
        appendMessage(contactId, { id: generateId(), from: 'them', text: randomReply(), ts: Date.now() });
        setTypingContactId((current) => (current === contactId ? null : current));
        notify({ title: contactName, message: 'New message' });
      }, delay);
    },
    [appendMessage]
  );

  return { threadsByContact, loading, typingContactId, sendMessage };
}
