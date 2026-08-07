import { useState } from 'react';

export default function CalculatorApp() {
  const [value, setValue] = useState('0');

  const press = (digit) => setValue((v) => (v === '0' ? digit : v + digit));
  const clear = () => setValue('0');

  return (
    <div className="flex h-full flex-col gap-3 p-4 font-mono">
      <div className="rounded-lg border-2 border-os-border-strong bg-os-surface-2 px-3 py-4 text-right text-2xl text-os-ink">
        {value}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            className="rounded-lg border-2 border-os-border-strong bg-os-surface py-2 text-os-ink hover:bg-os-accent hover:text-os-accent-ink"
          >
            {d}
          </button>
        ))}
        <button
          onClick={clear}
          className="col-span-3 rounded-lg border-2 border-os-border-strong bg-os-danger py-2 text-os-surface"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
