import { type Note, noteAt, noteIndex, semitoneDistance } from "./notes";

export type ScaleName =
  | "major"
  | "natural-minor"
  | "pentatonic-major"
  | "pentatonic-minor"
  | "blues-minor";

export const SCALES: Record<ScaleName, readonly number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  "natural-minor": [0, 2, 3, 5, 7, 8, 10],
  "pentatonic-major": [0, 2, 4, 7, 9],
  "pentatonic-minor": [0, 3, 5, 7, 10],
  "blues-minor": [0, 3, 5, 6, 7, 10],
};

export const SCALE_LABELS: Record<ScaleName, string> = {
  major: "Major",
  "natural-minor": "Natural Minor",
  "pentatonic-major": "Pentatonic Major",
  "pentatonic-minor": "Pentatonic Minor",
  "blues-minor": "Blues (Minor)",
};

export function scaleNotes(root: Note, scale: ScaleName): Note[] {
  const rootIdx = noteIndex(root);
  return SCALES[scale].map((s) => noteAt(rootIdx + s));
}

export function scaleDegree(
  root: Note,
  scale: ScaleName,
  note: Note,
): number | null {
  const semitones = semitoneDistance(root, note);
  const idx = SCALES[scale].indexOf(semitones);
  return idx === -1 ? null : idx + 1;
}
