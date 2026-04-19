import type { BassString, StructuredTab, TabSection } from "./schema";

export const BEAT_SUBDIVISIONS = 4;
export const STRING_ORDER_HIGH_TO_LOW: BassString[] = ["G", "D", "A", "E"];

export type GridCell = {
  bar: number;
  beat: number;
  sub: number;
  fret: number | null;
  rest: boolean;
};

export type GridRow = {
  string: BassString;
  cells: GridCell[];
};

export type SectionGrid = {
  sectionId: string;
  name: string;
  barCount: number;
  rows: GridRow[];
};

function subFromDur(): number {
  return 0;
}

export function renderSectionGrid(section: TabSection): SectionGrid {
  const barCount = Math.max(1, ...section.bars.map((n) => n.bar ?? 1));
  const colsPerBar = BEAT_SUBDIVISIONS * 4;
  const totalCols = barCount * colsPerBar;

  const rows: GridRow[] = STRING_ORDER_HIGH_TO_LOW.map((s) => ({
    string: s,
    cells: Array.from({ length: totalCols }, (_, idx) => ({
      bar: Math.floor(idx / colsPerBar) + 1,
      beat: Math.floor((idx % colsPerBar) / BEAT_SUBDIVISIONS) + 1,
      sub: (idx % BEAT_SUBDIVISIONS) + 1,
      fret: null,
      rest: false,
    })),
  }));

  for (const note of section.bars) {
    const bar = note.bar ?? 1;
    const col = (bar - 1) * colsPerBar + (note.beat - 1) * BEAT_SUBDIVISIONS + subFromDur();
    for (const row of rows) {
      if (note.string && row.string === note.string && !note.rest && note.fret !== undefined) {
        row.cells[col] = { ...row.cells[col], fret: note.fret, rest: false };
      }
    }
  }

  return { sectionId: section.id, name: section.name, barCount, rows };
}

export function renderGrid(tab: StructuredTab): SectionGrid[] {
  return tab.sections.map(renderSectionGrid);
}
