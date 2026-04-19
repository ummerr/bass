import type {
  BassString,
  Duration,
  StructuredTab,
  TabNote,
  TabSection,
} from "./schema";

export const SUBS_PER_BEAT = 4;
export const BEATS_PER_BAR = 4;
export const SUBS_PER_BAR = SUBS_PER_BEAT * BEATS_PER_BAR;
export const STRINGS_HIGH_TO_LOW: BassString[] = ["G", "D", "A", "E"];
export const STRINGS_LOW_TO_HIGH: BassString[] = ["E", "A", "D", "G"];

const DUR_SUBS: Record<Duration, number> = {
  "1/1": 16,
  "1/2": 8,
  "1/4": 4,
  "1/8": 2,
  "1/16": 1,
  "1/32": 1,
  "1/4.": 6,
  "1/8.": 3,
  "1/16.": 2,
  "1/4t": 3,
  "1/8t": 1,
  "1/16t": 1,
};

export function subFromDur(dur: Duration): number {
  return DUR_SUBS[dur];
}

export type GridCell =
  | { kind: "empty" }
  | { kind: "onset"; fret: number; span: number; eventIndex: number }
  | { kind: "tie"; eventIndex: number }
  | { kind: "rest"; span: number };

export type GridRow = {
  string: BassString;
  cells: GridCell[];
};

export type NoteEvent = {
  index: number;
  startSub: number;
  span: number;
  bar: number;
  beat: number;
  string?: BassString;
  fret?: number;
  rest: boolean;
};

export type SectionGrid = {
  sectionId: string;
  name: string;
  barCount: number;
  totalSubs: number;
  rows: GridRow[];
  events: NoteEvent[];
};

type StagedNote = {
  note: TabNote;
  startSub: number;
  span: number;
};

export function renderSectionGrid(section: TabSection): SectionGrid {
  const barCount = Math.max(1, ...section.bars.map((n) => n.bar ?? 1));
  const totalSubs = barCount * SUBS_PER_BAR;

  const staged: StagedNote[] = [];
  for (const note of section.bars) {
    const bar = note.bar ?? 1;
    const startSub =
      (bar - 1) * SUBS_PER_BAR + (note.beat - 1) * SUBS_PER_BEAT;
    const rawSpan = Math.max(1, subFromDur(note.dur));
    const span = Math.min(rawSpan, totalSubs - startSub);
    if (span <= 0) continue;
    staged.push({ note, startSub, span });
  }
  staged.sort((a, b) => a.startSub - b.startSub);

  const rows: GridRow[] = STRINGS_HIGH_TO_LOW.map((s) => ({
    string: s,
    cells: Array.from(
      { length: totalSubs },
      () => ({ kind: "empty" }) as GridCell,
    ),
  }));

  const events: NoteEvent[] = staged.map(({ note, startSub, span }, index) => ({
    index,
    startSub,
    span,
    bar: note.bar ?? 1,
    beat: note.beat,
    string: note.rest ? undefined : note.string,
    fret: note.rest ? undefined : note.fret,
    rest: note.rest === true,
  }));

  for (const event of events) {
    if (event.rest) continue;
    if (!event.string || event.fret === undefined) continue;
    const row = rows.find((r) => r.string === event.string);
    if (!row) continue;
    row.cells[event.startSub] = {
      kind: "onset",
      fret: event.fret,
      span: event.span,
      eventIndex: event.index,
    };
    for (let i = 1; i < event.span; i++) {
      if (row.cells[event.startSub + i].kind === "empty") {
        row.cells[event.startSub + i] = {
          kind: "tie",
          eventIndex: event.index,
        };
      }
    }
  }

  return {
    sectionId: section.id,
    name: section.name,
    barCount,
    totalSubs,
    rows,
    events,
  };
}

export function renderGrid(tab: StructuredTab): SectionGrid[] {
  return tab.sections.map(renderSectionGrid);
}
