import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getMonthGrid, formatDateKey, isSameDay, DAY_LABELS, MONTH_LABELS } from './dateUtils';
import { useCalendarEvents } from './useCalendarEvents';
import EventForm from './EventForm';

export default function CalendarApp() {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(today);
  const [selected, setSelected] = useState(today);
  const { eventsByDate, loading, addEvent, deleteEvent } = useCalendarEvents();

  const grid = useMemo(
    () => getMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const goToMonth = (delta) => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  const goToday = () => {
    setViewDate(today);
    setSelected(today);
  };

  const selectedKey = formatDateKey(selected);
  const selectedEvents = eventsByDate[selectedKey] ?? [];

  return (
    <div className="flex h-full flex-col">
      {/* Month header */}
      <div className="flex items-center justify-between border-b-2 border-os-border px-3 py-2">
        <button
          onClick={() => goToMonth(-1)}
          className="rounded p-1 text-os-ink-soft hover:bg-os-surface-2 hover:text-os-ink"
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-display text-[11px] text-os-ink">
            {MONTH_LABELS[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <button
            onClick={goToday}
            className="rounded-md border border-os-border px-1.5 py-0.5 text-[10px] text-os-ink-soft hover:bg-os-surface-2"
          >
            Today
          </button>
        </div>
        <button
          onClick={() => goToMonth(1)}
          className="rounded p-1 text-os-ink-soft hover:bg-os-surface-2 hover:text-os-ink"
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 px-2 pt-2">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center font-display text-[8px] text-os-ink-soft">
            {label}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-1 px-2 pb-2 pt-1">
        {grid.map((cell) => {
          const dayEvents = eventsByDate[cell.key] ?? [];
          const isSelected = isSameDay(cell.date, selected);
          const isToday = isSameDay(cell.date, today);
          return (
            <button
              key={cell.key}
              onClick={() => setSelected(cell.date)}
              className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border-2 text-[11px] ${
                isSelected
                  ? 'border-os-accent bg-os-accent text-os-accent-ink'
                  : isToday
                    ? 'border-os-accent text-os-ink'
                    : 'border-transparent text-os-ink hover:bg-os-surface-2'
              } ${!cell.inCurrentMonth ? 'opacity-35' : ''}`}
            >
              <span>{cell.date.getDate()}</span>
              {dayEvents.length > 0 && (
                <span
                  className={`h-1 w-1 rounded-full ${isSelected ? 'bg-os-accent-ink' : 'bg-os-accent'}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day panel */}
      <div className="flex flex-1 flex-col gap-2 overflow-auto border-t-2 border-os-border p-3">
        <span className="font-display text-[10px] text-os-ink-soft">
          {selected.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>

        {!loading && (
          <>
            {selectedEvents.length === 0 ? (
              <p className="text-[12px] text-os-ink-soft">No events.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {selectedEvents
                  .slice()
                  .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-2 rounded-lg border-2 border-os-border bg-os-surface-2 px-2.5 py-1.5"
                    >
                      {event.time && (
                        <span className="shrink-0 font-mono text-[11px] text-os-ink-soft">{event.time}</span>
                      )}
                      <span className="min-w-0 flex-1 truncate text-[12px] text-os-ink">{event.title}</span>
                      <button
                        onClick={() => deleteEvent(selectedKey, event.id)}
                        className="shrink-0 rounded p-0.5 text-os-ink-soft hover:bg-os-surface hover:text-os-danger"
                        aria-label="Delete event"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            <EventForm onAdd={(input) => addEvent(selectedKey, input)} />
          </>
        )}
      </div>
    </div>
  );
}
