import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { TRACKS } from './tracks';
import { MusicEngine } from './MusicEngine';
import Disk from './Disk';

/**
 * Music UI — a simple pixel-art record player. The audio engine and its
 * lifecycle are UNCHANGED from before this phase: the engine is created
 * once per mount, kept alive across minimize (the window stays mounted
 * while minimized — see WindowFrame), and disposed on close/unmount. This
 * phase only changes what's rendered.
 */
export default function MusicApp() {
  const engineRef = useRef(null);
  if (!engineRef.current) engineRef.current = new MusicEngine();

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const track = TRACKS[trackIndex];

  useEffect(() => {
    const engine = engineRef.current;

    // Automatically continue to the next real MP3 when a track finishes.
    engine.setEndedHandler(() => {
      setTrackIndex((current) => {
        const next = (current + 1) % TRACKS.length;
        void engine.play(TRACKS[next]).then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        return next;
      });
    });

    // IMPORTANT: this runs when the Music window is CLOSED. The WindowFrame
    // keeps this component mounted while minimized, so audio keeps playing.
    return () => engine.dispose();
  }, []);

  const playTrack = async (index) => {
    const nextIndex = (index + TRACKS.length) % TRACKS.length;
    const nextTrack = TRACKS[nextIndex];
    setTrackIndex(nextIndex);

    try {
      await engineRef.current.play(nextTrack);
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (isPlaying) {
      engineRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await engineRef.current.play(track);
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center gap-3 overflow-auto p-4">
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4">
        <Disk size="min(56%, 190px)" spinning={isPlaying} active />

        <span className="max-w-full truncate px-2 text-center font-display text-[13px] text-os-ink">
          {track.title}
        </span>

        <button
          type="button"
          onClick={togglePlay}
          className="pixel-cut flex h-14 w-14 items-center justify-center border-[length:var(--os-border-width)] border-os-border-strong bg-os-accent text-os-accent-ink shadow-os-window transition-transform hover:-translate-y-0.5 active:translate-y-0"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>
      </div>

      <div className="flex w-full shrink-0 flex-wrap items-center justify-center gap-2.5 border-t-2 border-os-border pt-3">
        {TRACKS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => void playTrack(i)}
            className="rounded-full transition-transform hover:-translate-y-0.5 active:translate-y-0"
            aria-label={t.title}
            aria-current={i === trackIndex ? 'true' : undefined}
            title={t.title}
          >
            <Disk size={44} active={i === trackIndex} />
          </button>
        ))}
      </div>
    </div>
  );
}
