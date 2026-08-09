import { useEffect, useState } from 'react';

/** Live local Date, ticking every second. Used by the navbar clock and its Date & Time panel. */
export function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}
