import { useCallback, useEffect, useRef, useState } from 'react';
import { virtualFS } from '../../core/filesystem/virtualFS';
import { notify } from '../../store/useNotificationStore';
import { CONTACTS, getConversationStep } from './contacts';

const MESSAGES_PATH = '/System/messages-v2.json';
const MESSAGE_STATE_VERSION = 3;
let idCounter = 0;

const generateId = () => `msg_${Date.now()}_${idCounter++}`;

function createSeedState() {
  const threads = {};
  const progress = {};

  CONTACTS.forEach((contact) => {
    const opening = contact.conversation?.[0];

    threads[contact.id] = opening
      ? [
        {
          id: generateId(),
          from: 'them',
          text: opening.text,
          ts: Date.now(),
        },
      ]
      : [];

    progress[contact.id] = opening?.id ?? null;
  });

  return { threads, progress };
}

function normalizeStoredState(parsed) {
  if (
    parsed &&
    parsed.version === MESSAGE_STATE_VERSION &&
    parsed.threads &&
    parsed.progress
  ) {
    const seeded = createSeedState();

    const normalizedProgress = { ...seeded.progress };

    CONTACTS.forEach((contact) => {
      const storedNode = parsed.progress[contact.id];
      const validNode =
        storedNode === null ||
        typeof storedNode === 'string' &&
        Boolean(getConversationStep(contact.id, storedNode));

      normalizedProgress[contact.id] = validNode
        ? storedNode
        : seeded.progress[contact.id];
    });

    return {
      threads: { ...seeded.threads, ...parsed.threads },
      progress: normalizedProgress,
    };
  }

  // Version 2 used numeric progress. Reset it into the new node-based
  // branching format rather than trying to reinterpret old conversation state.
  return createSeedState();
}

export function useMessages() {
  const [threadsByContact, setThreadsByContact] = useState({});
  const [progressByContact, setProgressByContact] = useState({});
  const [pendingContactId, setPendingContactId] = useState(null);
  const [loading, setLoading] = useState(true);

  const threadsRef = useRef({});
  const progressRef = useRef({});
  const pendingRef = useRef(null);

  const syncRefs = (threads, progress) => {
    threadsRef.current = threads;
    progressRef.current = progress;
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!(await virtualFS.exists(MESSAGES_PATH))) {
        await virtualFS.mkdir('/System', { recursive: true });

        const initial = createSeedState();
        const stored = {
          version: MESSAGE_STATE_VERSION,
          ...initial,
        };

        await virtualFS.writeFile(
          MESSAGES_PATH,
          JSON.stringify(stored, null, 2)
        );
      }

      const raw = await virtualFS.readFile(MESSAGES_PATH);

      if (!cancelled) {
        try {
          const parsed = JSON.parse(raw);
          const normalized = normalizeStoredState(parsed);

          syncRefs(normalized.threads, normalized.progress);
          setThreadsByContact(normalized.threads);
          setProgressByContact(normalized.progress);

          // Migrate old numeric-progress data (or malformed state) into the
          // node-based branching format.
          if (parsed?.version !== MESSAGE_STATE_VERSION) {
            await virtualFS.writeFile(
              MESSAGES_PATH,
              JSON.stringify(
                {
                  version: MESSAGE_STATE_VERSION,
                  ...normalized,
                },
                null,
                2
              )
            );
          }
        } catch {
          const initial = createSeedState();
          syncRefs(initial.threads, initial.progress);
          setThreadsByContact(initial.threads);
          setProgressByContact(initial.progress);

          await virtualFS.writeFile(
            MESSAGES_PATH,
            JSON.stringify(
              {
                version: MESSAGE_STATE_VERSION,
                ...initial,
              },
              null,
              2
            )
          );
        }

        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (nextThreads, nextProgress) => {
    syncRefs(nextThreads, nextProgress);
    setThreadsByContact(nextThreads);
    setProgressByContact(nextProgress);

    await virtualFS.writeFile(
      MESSAGES_PATH,
      JSON.stringify(
        {
          version: MESSAGE_STATE_VERSION,
          threads: nextThreads,
          progress: nextProgress,
        },
        null,
        2
      )
    );
  }, []);

  const sendMessage = useCallback(
    (contactId, optionIndex, contactName) => {
      if (pendingRef.current === contactId) return;

      const currentNodeId = progressRef.current[contactId];
      const step = getConversationStep(contactId, currentNodeId);

      if (!step || !step.options?.[optionIndex]) return;

      const selectedOption = step.options[optionIndex];

      const userMessage = {
        id: generateId(),
        from: 'me',
        text: selectedOption.text,
        ts: Date.now(),
      };

      const nextThreads = {
        ...threadsRef.current,
        [contactId]: [
          ...(threadsRef.current[contactId] ?? []),
          userMessage,
        ],
      };

      syncRefs(nextThreads, progressRef.current);
      setThreadsByContact(nextThreads);

      pendingRef.current = contactId;
      setPendingContactId(contactId);

      const delay = 700 + Math.random() * 850;

      window.setTimeout(async () => {
        const nextNodeId = selectedOption.next ?? null;
        const nextProgress = {
          ...progressRef.current,
          [contactId]: nextNodeId,
        };

        let finalThreads = threadsRef.current;

        if (selectedOption.reply) {
          const contactMessage = {
            id: generateId(),
            from: 'them',
            text: selectedOption.reply,
            ts: Date.now(),
          };

          finalThreads = {
            ...threadsRef.current,
            [contactId]: [
              ...(threadsRef.current[contactId] ?? []),
              contactMessage,
            ],
          };
        }

        await persist(finalThreads, nextProgress);

        pendingRef.current = null;
        setPendingContactId(null);

        if (selectedOption.reply) {
          notify({
            title: contactName,
            message: 'New message',
          });
        }
      }, delay);
    },
    [persist]
  );

  return {
    threadsByContact,
    progressByContact,
    pendingContactId,
    loading,
    sendMessage,
  };
}
