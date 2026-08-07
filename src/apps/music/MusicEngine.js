import { noteFreq } from './notes';

const ATTACK = 0.01;
const RELEASE = 0.06;
const NOTE_GAP = 0.02; // small silence between notes so they don't blur together

export class MusicEngine {
  #ctx = null;
  #masterGain = null;
  #analyser = null;
  #activeNodes = [];
  #loopTimeoutId = null;
  #isPlaying = false;
  #currentTrackId = null;
  #currentWave = 'square';
  #volume = 0.5;

  #ensureContext() {
    if (this.#ctx) return;
    this.#ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.#masterGain = this.#ctx.createGain();
    this.#masterGain.gain.value = this.#volume;
    this.#analyser = this.#ctx.createAnalyser();
    this.#analyser.fftSize = 64;
    this.#masterGain.connect(this.#analyser);
    this.#analyser.connect(this.#ctx.destination);
  }

  get isPlaying() {
    return this.#isPlaying;
  }

  get currentTrackId() {
    return this.#currentTrackId;
  }

  setVolume(v) {
    this.#volume = v;
    if (this.#masterGain) this.#masterGain.gain.setTargetAtTime(v, this.#ctx.currentTime, 0.01);
  }

  /** Returns a Uint8Array of frequency-bin magnitudes for the visualizer, or null if not playing. */
  getVisualizerData() {
    if (!this.#analyser) return null;
    const data = new Uint8Array(this.#analyser.frequencyBinCount);
    this.#analyser.getByteFrequencyData(data);
    return data;
  }

  #scheduleNote(freqs, startTime, duration) {
    const peak = this.#volume > 0 ? 0.18 : 0; // per-note ceiling so chords don't clip
    for (const freq of freqs) {
      const osc = this.#ctx.createOscillator();
      const gain = this.#ctx.createGain();
      osc.type = this.#currentWave;
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(peak, startTime + ATTACK);
      gain.gain.setValueAtTime(peak, Math.max(startTime + ATTACK, startTime + duration - RELEASE));
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(gain);
      gain.connect(this.#masterGain);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
      this.#activeNodes.push(osc, gain);
    }
  }

  #playLoop(track) {
    this.#ensureContext();
    this.#currentWave = track.wave;
    const secondsPerBeat = 60 / track.bpm;
    let cursor = this.#ctx.currentTime + 0.05;
    let loopDuration = 0;

    for (const step of track.sequence) {
      const duration = step.beats * secondsPerBeat - NOTE_GAP;
      const freqs = step.notes.map(noteFreq);
      this.#scheduleNote(freqs, cursor, Math.max(duration, 0.02));
      cursor += step.beats * secondsPerBeat;
      loopDuration += step.beats * secondsPerBeat;
    }

    this.#loopTimeoutId = setTimeout(() => {
      if (this.#isPlaying && this.#currentTrackId === track.id) {
        this.#activeNodes = []; // prior notes have already finished playing
        this.#playLoop(track);
      }
    }, loopDuration * 1000);
  }

  play(track) {
    this.stop();
    this.#isPlaying = true;
    this.#currentTrackId = track.id;
    this.#playLoop(track);
  }

  stop() {
    this.#isPlaying = false;
    this.#currentTrackId = null;
    if (this.#loopTimeoutId) {
      clearTimeout(this.#loopTimeoutId);
      this.#loopTimeoutId = null;
    }
    for (const node of this.#activeNodes) {
      try {
        node.stop?.();
      } catch {
        // Already stopped — fine to ignore.
      }
      node.disconnect?.();
    }
    this.#activeNodes = [];
  }

  dispose() {
    this.stop();
    this.#ctx?.close();
    this.#ctx = null;
  }
}
