import { NOTES, type Note, noteIndex } from "./notes";

export type KeyMode = "major" | "minor";
export type Key = { root: Note; mode: KeyMode };

const FLAT_TO_SHARP: Record<string, Note> = {
  Bb: "A#",
  Eb: "D#",
  Ab: "G#",
  Db: "C#",
  Gb: "F#",
  Cb: "B",
  Fb: "E",
};

function normalizeRoot(raw: string): Note | null {
  const canonical = raw[0].toUpperCase() + raw.slice(1);
  const mapped = FLAT_TO_SHARP[canonical] ?? canonical;
  return (NOTES as readonly string[]).includes(mapped)
    ? (mapped as Note)
    : null;
}

export function parseKey(input: string | null | undefined): Key | null {
  if (!input) return null;
  const match = /^\s*([A-Ga-g][#b]?)\s*(major|minor|maj|min|m)?\s*$/.exec(
    input,
  );
  if (!match) return null;
  const root = normalizeRoot(match[1]);
  if (!root) return null;
  const modeStr = match[2]?.toLowerCase();
  const mode: KeyMode =
    modeStr === "minor" || modeStr === "min" || modeStr === "m"
      ? "minor"
      : "major";
  return { root, mode };
}

// Maps semitones-from-C to position on the circle of fifths (0..11).
// Position 0 = C major / A minor (no sharps or flats).
const SEMITONE_TO_CIRCLE_POSITION: Record<number, number> = {
  0: 0, // C
  7: 1, // G
  2: 2, // D
  9: 3, // A
  4: 4, // E
  11: 5, // B
  6: 6, // F#
  1: 7, // C# / Db
  8: 8, // G# / Ab
  3: 9, // D# / Eb
  10: 10, // A# / Bb
  5: 11, // F
};

export function circlePosition(key: Key): number {
  const majorRootSemitones =
    key.mode === "major"
      ? noteIndex(key.root)
      : (noteIndex(key.root) + 3) % 12;
  return SEMITONE_TO_CIRCLE_POSITION[majorRootSemitones];
}

// −7..+7, where negative numbers are flats and positive numbers are sharps.
export function keySignature(key: Key): number {
  const pos = circlePosition(key);
  return pos <= 6 ? pos : pos - 12;
}

type OklchCss = string;

function oklch(l: number, c: number, h: number): OklchCss {
  return `oklch(${l} ${c} ${h})`;
}

export type KeyStyle = Record<`--${string}`, string>;

// Perceptually even spacing: 30° per circle-of-fifths step. C major sits at 0°
// (warm red) and keys walk around the wheel; adjacent hues = adjacent signatures.
// Major = brighter, minor = muted — so relative pairs share the hue but read
// differently. OKLCH keeps chroma constant so no key "screams" against the others.
export function keyCssVars(key: Key): KeyStyle {
  const hue = circlePosition(key) * 30;
  const accentL = key.mode === "major" ? 0.62 : 0.48;
  return {
    "--key-accent": oklch(accentL, 0.14, hue),
    "--key-tint": oklch(0.96, 0.025, hue),
    "--key-border": oklch(0.82, 0.08, hue),
  };
}

export function safeKeyCssVars(
  input: string | null | undefined,
): KeyStyle | undefined {
  const key = parseKey(input);
  return key ? keyCssVars(key) : undefined;
}
