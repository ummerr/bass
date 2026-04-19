import { type Note, transpose } from "./notes";

export const STANDARD_BASS_TUNING: readonly Note[] = ["G", "D", "A", "E"];

export const DEFAULT_FRET_COUNT = 12;

export const FRET_MARKERS: readonly number[] = [3, 5, 7, 9, 15, 17, 19, 21];
export const DOUBLE_FRET_MARKERS: readonly number[] = [12, 24];

export type Fretboard = Note[][];

export function fretNote(openNote: Note, fret: number): Note {
  return transpose(openNote, fret);
}

export function buildFretboard(
  tuning: readonly Note[] = STANDARD_BASS_TUNING,
  frets: number = DEFAULT_FRET_COUNT,
): Fretboard {
  return tuning.map((open) =>
    Array.from({ length: frets + 1 }, (_, f) => fretNote(open, f)),
  );
}
