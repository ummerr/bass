export const INTERVAL_NAMES = [
  "P1",
  "m2",
  "M2",
  "m3",
  "M3",
  "P4",
  "TT",
  "P5",
  "m6",
  "M6",
  "m7",
  "M7",
] as const;

export type IntervalName = (typeof INTERVAL_NAMES)[number];

export const INTERVAL_LONG_NAMES: Record<IntervalName, string> = {
  P1: "Perfect Unison",
  m2: "Minor 2nd",
  M2: "Major 2nd",
  m3: "Minor 3rd",
  M3: "Major 3rd",
  P4: "Perfect 4th",
  TT: "Tritone",
  P5: "Perfect 5th",
  m6: "Minor 6th",
  M6: "Major 6th",
  m7: "Minor 7th",
  M7: "Major 7th",
};

export function intervalName(semitones: number): IntervalName {
  const idx = ((semitones % 12) + 12) % 12;
  return INTERVAL_NAMES[idx];
}
