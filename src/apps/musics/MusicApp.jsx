import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume1, Volume2 } from 'lucide-react';
import recordImage from '../../assets/icons/record.webp';
import { TRACKS } from './tracks';
import { MusicEngine } from './MusicEngine';
import Disk from './Disk';


export default function MusicApp() {
  const engineRef = useRef(null);
  if (!engineRef.current) engineRef.current = new MusicEngine();

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const track = TRACKS[trackIndex];

  useEffect(() => {
    const engine = engineRef.current;

    engine.setEndedHandler(() => {
      setTrackIndex((current) => {
        const next = (current + 1) % TRACKS.length;
        void engine
          .play(TRACKS[next])
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
        return next;
      });
    });

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

  const handleVolume = (event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    engineRef.current.setVolume(nextVolume);
  };

  return (
    <div className="music-app flex h-full w-full min-h-0 items-center justify-center overflow-hidden p-2 sm:p-3">
      <div className="music-app__panel flex h-full min-h-0 w-full max-w-107.5 flex-col items-center justify-center overflow-hidden px-3 py-3 sm:px-5 sm:py-4">
        <div className="music-app__main flex w-full flex-none flex-col items-center justify-center">
          <div className="music-app__record-wrap flex shrink-0 items-center justify-center">
            <img
              src={recordImage}
              alt=""
              aria-hidden="true"
              className={`music-app__record ${isPlaying ? 'music-app__record--playing' : ''}`}
              style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
            />
          </div>

          <div className="music-app__track mt-2 flex w-full min-h-0 flex-col items-center text-center">
            <div className="music-app__title max-w-full truncate px-2 font-display text-[13px] leading-5 text-os-ink">
              {track.title}
            </div>
            <div className="music-app__subtitle mt-0.5 font-mono text-[9px] leading-4 text-os-ink-soft">
              Minimize me, The Music keeps playing.
            </div>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            className="pixel-cut music-app__play mt-2 flex shrink-0 items-center justify-center border-(length:--os-border-width) border-os-border-strong bg-os-surface-2 text-os-ink shadow-os-window transition-transform hover:-translate-y-0.5 active:translate-y-0"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} strokeWidth={2.5} /> : <Play size={18} strokeWidth={2.5} className="ml-0.5" />}
          </button>

          <div className="music-app__volume my-4 flex w-full max-w-75 items-center gap-2 px-1">
            {volume === 0 ? (
              <Volume1 size={15} className="shrink-0 text-os-ink-soft" aria-hidden="true" />
            ) : (
              <Volume2 size={15} className="shrink-0 text-os-ink-soft" aria-hidden="true" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolume}
              aria-label="Volume"
              className="music-app__volume-slider min-w-0 flex-1"
              style={{ '--volume-progress': `${volume * 100}%` }}
            />
          </div>
        </div>

       <div className="music-app__discs mt-0 w-full max-w-[320px] shrink-0 border-t-2 border-os-border pt-2">
  <div className="my-3 text-center font-display text-[8px] tracking-[0.16em] text-os-ink-soft">
    DISCS
  </div>

  <div className="flex items-center justify-center gap-2">
    {TRACKS.map((t, i) => {
      const isSelected = i === trackIndex;

      return (
        <button
          key={t.id}
          type="button"
          onClick={() => void playTrack(i)}
          className={`relative flex h-10 w-10 shrink-0 items-center justify-center transition-transform hover:-translate-y-0.5 active:translate-y-0 ${
            isSelected ? 'bg-black' : 'bg-transparent'
          }`}
          aria-label={t.title}
          aria-current={isSelected ? 'true' : undefined}
          title={t.title}
        >
          <Disk size={40} active={false} />
        </button>
      );
    })}
  </div>
</div>
      </div>
    </div>
  );
}
