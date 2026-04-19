export const NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type Note = (typeof NOTES)[number];

export function noteAt(semitones: number): Note {
  const idx = ((semitones % 12) + 12) % 12;
  return NOTES[idx];
}

export function noteIndex(note: Note): number {
  return NOTES.indexOf(note);
}

export function transpose(note: Note, semitones: number): Note {
  return noteAt(noteIndex(note) + semitones);
}

export function semitoneDistance(from: Note, to: Note): number {
  return ((noteIndex(to) - noteIndex(from)) % 12 + 12) % 12;
}
