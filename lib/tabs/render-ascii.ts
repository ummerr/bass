import type { BassString, StructuredTab, TabSection } from "./schema";

const STRING_ORDER: BassString[] = ["G", "D", "A", "E"];
const BEATS_PER_BAR = 4;
const CHARS_PER_BEAT = 3;
const TRAILING_DASHES = 5;

export function renderSection(section: TabSection): string[] {
  const barCount = Math.max(1, ...section.bars.map((n) => n.bar ?? 1));
  const cells: Record<BassString, string[]> = { G: [], D: [], A: [], E: [] };
  const width = barCount * BEATS_PER_BAR;
  for (const s of STRING_ORDER) {
    for (let i = 0; i < width; i++) cells[s].push("-");
  }

  for (const note of section.bars) {
    if (note.rest || note.string === undefined || note.fret === undefined) {
      continue;
    }
    const bar = note.bar ?? 1;
    const col = (bar - 1) * BEATS_PER_BAR + (note.beat - 1);
    cells[note.string][col] = String(note.fret);
  }

  return STRING_ORDER.map((s) => {
    let line = `${s}|`;
    for (const cell of cells[s]) {
      line += "-".repeat(Math.max(0, CHARS_PER_BEAT - cell.length)) + cell;
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
