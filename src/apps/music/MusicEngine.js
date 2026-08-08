/**
 * Real MP3 music engine.
 *
 * The HTMLAudioElement is kept alive for the lifetime of the MusicApp window.
 * Minimizing the window does NOT unmount the app, so playback continues.
 * Closing the window calls dispose(), which stops playback and releases the
 * audio element.
 */
export class MusicEngine {
  #audio = null;
  #ctx = null;
  #source = null;
  #analyser = null;
  #masterGain = null;
  #isPlaying = false;
  #currentTrackId = null;
  #volume = 0.5;
  #onEnded = null;

  #ensureAudio() {
    if (this.#audio) return;

    this.#audio = new Audio();
    this.#audio.preload = 'auto';
    this.#audio.volume = this.#volume;

    this.#audio.addEventListener('play', () => {
      this.#isPlaying = true;
    });

    this.#audio.addEventListener('pause', () => {
      this.#isPlaying = false;
    });

    this.#audio.addEventListener('ended', () => {
      this.#isPlaying = false;
      this.#onEnded?.();
    });
  }

  #ensureAnalyser() {
    this.#ensureAudio();
    if (this.#analyser) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.#ctx = new AudioContext();
    this.#source = this.#ctx.createMediaElementSource(this.#audio);
    this.#masterGain = this.#ctx.createGain();
    this.#analyser = this.#ctx.createAnalyser();
    this.#analyser.fftSize = 64;

    this.#source.connect(this.#masterGain);
    this.#masterGain.connect(this.#analyser);
    this.#analyser.connect(this.#ctx.destination);
    this.#masterGain.gain.value = 1;
  }

  get isPlaying() {
    return this.#isPlaying;
  }

  get currentTrackId() {
    return this.#currentTrackId;
  }

  setEndedHandler(handler) {
    this.#onEnded = typeof handler === 'function' ? handler : null;
  }

  setVolume(value) {
    const volume = Math.max(0, Math.min(1, Number(value) || 0));
    this.#volume = volume;
    if (this.#audio) this.#audio.volume = volume;
  }

  getVisualizerData() {
    if (!this.#analyser) return null;
    const data = new Uint8Array(this.#analyser.frequencyBinCount);
    this.#analyser.getByteFrequencyData(data);
    return data;
  }

  async play(track) {
    this.#ensureAudio();

    if (this.#currentTrackId !== track.id) {
      this.#audio.pause();
      this.#audio.currentTime = 0;
      this.#audio.src = track.src;
      this.#audio.load();
      this.#currentTrackId = track.id;
    }

    // Create the visualizer graph after a user gesture (Play/track click),
    // which also avoids unnecessary AudioContext creation.
    this.#ensureAnalyser();
    if (this.#ctx?.state === 'suspended') await this.#ctx.resume();

    try {
      await this.#audio.play();
      this.#isPlaying = true;
    } catch (error) {
      this.#isPlaying = false;
      console.error('[MusicEngine] Unable to play track:', error);
      throw error;
    }
  }

  pause() {
    if (!this.#audio) return;
    this.#audio.pause();
    this.#isPlaying = false;
  }

  stop() {
    if (!this.#audio) return;
    this.#audio.pause();
    this.#audio.currentTime = 0;
    this.#isPlaying = false;
    this.#currentTrackId = null;
  }

  dispose() {
    this.stop();
    this.#audio?.removeAttribute('src');
    this.#audio?.load();
    this.#audio = null;
    this.#source?.disconnect();
    this.#masterGain?.disconnect();
    this.#analyser?.disconnect();
    this.#source = null;
    this.#masterGain = null;
    this.#analyser = null;
    this.#ctx?.close();
    this.#ctx = null;
    this.#onEnded = null;
  }
}
