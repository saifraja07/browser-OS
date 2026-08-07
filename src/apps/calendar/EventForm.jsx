import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function EventForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), time });
    setTitle('');
    setTime('');
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-1.5">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add an event…"
        className="min-w-0 flex-1 rounded-lg border-2 border-os-border bg-os-surface px-2 py-1 text-[12px] text-os-ink outline-none focus:border-os-accent"
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="w-24 rounded-lg border-2 border-os-border bg-os-surface px-1.5 py-1 text-[11px] text-os-ink outline-none focus:border-os-accent"
      />
      <button
        type="submit"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-os-border-strong bg-os-accent text-os-accent-ink hover:-translate-y-0.5"
        aria-label="Add event"
      >
        <Plus size={14} />
      </button>
    </form>
  );
}
