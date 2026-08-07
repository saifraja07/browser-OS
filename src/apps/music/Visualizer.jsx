import { useEffect, useRef } from 'react';

const BAR_COUNT = 20;

export default function Visualizer({ engine, isPlaying }) {
  const barsRef = useRef([]);
  const frameRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const data = isPlaying ? engine.getVisualizerData() : null;
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const magnitude = data ? data[i % data.length] / 255 : 0;
        const height = 8 + magnitude * 40;
        bar.style.height = `${height}px`;
        bar.style.opacity = isPlaying ? String(0.5 + magnitude * 0.5) : '0.25';
      });
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [engine, isPlaying]);

  return (
    <div className="flex h-14 items-end justify-center gap-1">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (barsRef.current[i] = el)}
          className="w-1.5 rounded-t-sm bg-os-accent transition-[height] duration-75"
          style={{ height: 8 }}
        />
      ))}
    </div>
  );
}
