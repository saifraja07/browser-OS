import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { TRACKS } from './tracks';
import { MusicEngine } from './MusicEngine';
import Visualizer from './Visualizer';

export default function MusicApp() {
  const engineRef = useRef(null);
  if (!engineRef.current) engineRef.current = new MusicEngine();

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const track = TRACKS[trackIndex];

  useEffect(() => {
    // Web Audio contexts must be torn down when the window closes, or
    // they'll keep running silently in the background.
    return () => engineRef.current.dispose();
  }, []);

  const playTrack = (index) => {
    const t = TRACKS[index];
    setTrackIndex(index);
    engineRef.current.play(t);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      engineRef.current.stop();
      setIsPlaying(false);
    } else {
      playTrack(trackIndex);
    }
  };

  const skip = (delta) => {
    playTrack((trackIndex + delta + TRACKS.length) % TRACKS.length);
  };

  const handleVolume = (v) => {
    setVolume(v);
    engineRef.current.setVolume(v);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Now playing */}
      <div className="flex flex-col items-center gap-2 border-b-2 border-os-border px-4 py-4">
        <span className="font-display text-[12px] text-os-ink">{track.title}</span>
        <span className="text-[11px] text-os-ink-soft">{track.mood}</span>
        <Visualizer engine={engineRef.current} isPlaying={isPlaying} />
      </div>

      {/* Transport */}
      <div className="flex items-center justify-center gap-4 py-3">
        <button
          onClick={() => skip(-1)}
          className="rounded-full p-2 text-os-ink-soft hover:bg-os-surface-2 hover:text-os-ink"
          aria-label="Previous track"
        >
          <SkipBack size={16} />
        </button>
        <button
          onClick={togglePlay}
          className="pixel-cut flex h-11 w-11 items-center justify-center border-2 border-os-border-strong bg-os-accent text-os-accent-ink hover:-translate-y-0.5"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          onClick={() => skip(1)}
          className="rounded-full p-2 text-os-ink-soft hover:bg-os-surface-2 hover:text-os-ink"
          aria-label="Next track"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 px-4 pb-2">
        {volume === 0 ? <VolumeX size={14} className="text-os-ink-soft" /> : <Volume2 size={14} className="text-os-ink-soft" />}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => handleVolume(Number(e.target.value))}
          className="flex-1 accent-os-accent"
        />
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-auto border-t-2 border-os-border p-2">
        {TRACKS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => playTrack(i)}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] ${
              i === trackIndex ? 'bg-os-accent text-os-accent-ink' : 'text-os-ink hover:bg-os-surface-2'
            }`}
          >
            <span>{t.title}</span>
            <span className="text-[10px] opacity-70">{t.bpm} BPM</span>
          </button>
        ))}
      </div>
    </div>
  );
}
