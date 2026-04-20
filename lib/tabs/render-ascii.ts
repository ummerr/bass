import type { BassString, StructuredTab, TabSection } from "./schema";

const STRING_ORDER: BassString[] = ["G", "D", "A", "E"];
const BEATS_PER_BAR = 4;
const SUBS_PER_BEAT = 4;
const SUBS_PER_BAR = BEATS_PER_BAR * SUBS_PER_BEAT;
const CHARS_PER_SUB = 2;
const TRAILING_DASHES = 2;

export function renderSection(section: TabSection): string[] {
  const barCount = Math.max(1, ...section.bars.map((n) => n.bar ?? 1));
  const cells: Record<BassString, string[]> = { G: [], D: [], A: [], E: [] };
  const width = barCount * SUBS_PER_BAR;
  for (const s of STRING_ORDER) {
    for (let i = 0; i < width; i++) cells[s].push("-");
  }

  for (const note of section.bars) {
    if (note.rest || note.string === undefined || note.fret === undefined) {
      continue;
    }
    const bar = note.bar ?? 1;
    const sub = note.sub ?? 0;
    const col =
      (bar - 1) * SUBS_PER_BAR + (note.beat - 1) * SUBS_PER_BEAT + sub;
    cells[note.string][col] = String(note.fret);
  }

  return STRING_ORDER.map((s) => {
    let line = `${s}|`;
    for (const cell of cells[s]) {
      line += "-".repeat(Math.max(0, CHARS_PER_SUB - cell.length)) + cell;
    }
    line += "-".repeat(TRAILING_DASHES) + "|";
    return line;
  });
}

export type RenderedAscii = {
  lines: string[];
  sectionRanges: Map<string, { start: number; end: number }>;
};

export function renderAscii(tab: StructuredTab): RenderedAscii {
  const lines: string[] = [];
  const sectionRanges = new Map<string, { start: number; end: number }>();
  tab.sections.forEach((section, i) => {
    if (i > 0) lines.push("");
    const startIdx = lines.length;
    for (const l of renderSection(section)) lines.push(l);
    const endIdx = lines.length - 1;
    sectionRanges.set(section.id, { start: startIdx, end: endIdx });
  });
  return { lines, sectionRanges };
}
