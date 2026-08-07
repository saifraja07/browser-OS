import { useCallback, useEffect, useState } from 'react';
import { virtualFS } from '../../core/filesystem/virtualFS';

const EVENTS_PATH = '/System/calendar.json';

let idCounter = 0;
const generateId = () => `evt_${Date.now()}_${idCounter++}`;

export function useCalendarEvents() {
  const [eventsByDate, setEventsByDate] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(await virtualFS.exists(EVENTS_PATH))) {
        await virtualFS.mkdir('/System', { recursive: true });
        await virtualFS.writeFile(EVENTS_PATH, '{}');
      }
      const raw = await virtualFS.readFile(EVENTS_PATH);
      if (!cancelled) {
        try {
          setEventsByDate(JSON.parse(raw));
        } catch {
          setEventsByDate({});
        }
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next) => {
    setEventsByDate(next);
    await virtualFS.writeFile(EVENTS_PATH, JSON.stringify(next, null, 2));
  }, []);

  const addEvent = useCallback(
    (dateKey, { title, time }) => {
      const event = { id: generateId(), title, time: time || null };
      const dayEvents = eventsByDate[dateKey] ?? [];
      persist({ ...eventsByDate, [dateKey]: [...dayEvents, event] });
    },
    [eventsByDate, persist]
  );

  const deleteEvent = useCallback(
    (dateKey, id) => {
      const dayEvents = (eventsByDate[dateKey] ?? []).filter((e) => e.id !== id);
      const next = { ...eventsByDate };
      if (dayEvents.length > 0) next[dateKey] = dayEvents;
      else delete next[dateKey];
      persist(next);
    },
    [eventsByDate, persist]
  );

  return { eventsByDate, loading, addEvent, deleteEvent };
}
