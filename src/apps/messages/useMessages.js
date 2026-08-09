import { useCallback, useEffect, useRef, useState } from 'react';
import { virtualFS } from '../../core/filesystem/virtualFS';
import { notify } from '../../store/useNotificationStore';
import { CONTACTS, getConversationStep } from './contacts';

const MESSAGES_PATH = '/System/messages-v2.json';
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

    progress[contact.id] = 0;
  });

  return { threads, progress };
}

function normalizeStoredState(parsed) {
  if (
    parsed &&
    parsed.version === 2 &&
    parsed.threads &&
    parsed.progress
  ) {
    const seeded = createSeedState();

    return {
      threads: { ...seeded.threads, ...parsed.threads },
      progress: { ...seeded.progress, ...parsed.progress },
    };
  }

  // The previous Messages app used a different storage format.
  // Start the new branching conversation system in its own file so
  // existing local data is never destroyed.
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
          version: 2,
          ...initial,
        };

        await virtualFS.writeFile(MESSAGES_PATH, JSON.stringify(stored, null, 2));
      }

      const raw = await virtualFS.readFile(MESSAGES_PATH);

      if (!cancelled) {
        try {
          const parsed = JSON.parse(raw);
          const normalized = normalizeStoredState(parsed);

          syncRefs(normalized.threads, normalized.progress);
          setThreadsByContact(normalized.threads);
          setProgressByContact(normalized.progress);

          // Persist normalized state if the file was created from an older shape.
          if (parsed?.version !== 2) {
            await virtualFS.writeFile(
              MESSAGES_PATH,
              JSON.stringify(
                {
                  version: 2,
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
                version: 2,
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
          version: 2,
          threads: nextThreads,
          progress: nextProgress,
        },
        null,
        2
      )
    );
  }, []);

  const appendMessage = useCallback(
    (contactId, message) => {
      const nextThreads = {
        ...threadsRef.current,
        [contactId]: [
          ...(threadsRef.current[contactId] ?? []),
          message,
        ],
      };

      syncRefs(nextThreads, progressRef.current);
      setThreadsByContact(nextThreads);

      return nextThreads;
    },
    []
  );

  const sendMessage = useCallback(
    (contactId, optionIndex, contactName) => {
      if (pendingRef.current === contactId) return;

      const currentStepIndex = progressRef.current[contactId] ?? 0;
      const step = getConversationStep(contactId, currentStepIndex);

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
        const nextStepIndex = currentStepIndex + 1;
        const nextProgress = {
          ...progressRef.current,
          [contactId]: nextStepIndex,
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

        syncRefs(finalThreads, nextProgress);
        setThreadsByContact(finalThreads);
        setProgressByContact(nextProgress);

        await virtualFS.writeFile(
          MESSAGES_PATH,
          JSON.stringify(
            {
              version: 2,
              threads: finalThreads,
              progress: nextProgress,
            },
            null,
            2
          )
        );

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
    []
  );

  return {
    threadsByContact,
    progressByContact,
    pendingContactId,
    loading,
    sendMessage,
  };
}
