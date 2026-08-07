const SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Converts a note name like "C4", "A#3", "G5" to its frequency in Hz. */
export function noteFreq(name) {
  const match = name.match(/^([A-G])(#)?(-?\d)$/);
  if (!match) throw new Error(`Invalid note name: ${name}`);
  const [, letter, sharp, octaveStr] = match;
  const octave = Number(octaveStr);
  const semitone = SEMITONES[letter] + (sharp ? 1 : 0);
  const midi = (octave + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}
