"use client";

import type { BassString } from "@/lib/tabs/schema";
import type { NoteEvent, SectionGrid } from "@/lib/tabs/render-grid";
import type { BeatGridSelection } from "./BeatGrid";

const FRET_COUNT = 12;
const FRET_W = 42;
const STRING_GAP = 34;
const PAD_L = 44;
const PAD_R = 20;
const PAD_Y = 24;
const WIDTH = PAD_L + PAD_R + FRET_W * FRET_COUNT;

const FRET_MARKERS = [3, 5, 7, 9];
const DOUBLE_FRET_MARKERS = [12];

type Props = {
  sections: SectionGrid[];
  stringOrder: BassString[];
  activeSectionId: string | null;
  currentSub: number | null;
  selection: BeatGridSelection;
  onSelect: (sel: BeatGridSelection) => void;
};

export function FretboardSequence({
  sections,
  stringOrder,
  activeSectionId,
  currentSub,
  selection,
  onSelect,
}: Props) {
  const activeSection =
    (activeSectionId &&
      sections.find((s) => s.sectionId === activeSectionId)) ||
    sections[0];
  if (!activeSection) return null;

  const height = PAD_Y * 2 + STRING_GAP * (stringOrder.length - 1);
  const notes = activeSection.events.filter((e) => !e.rest);

  const currentEventIndex =
    currentSub === null
      ? null
      : findEventAt(activeSection.events, currentSub);
  const highlightedIndex =
    selection && selection.sectionId === activeSection.sectionId
      ? selection.eventIndex
      : currentEventIndex;

  function stringY(stringName: BassString): number {
    const idx = stringOrder.indexOf(stringName);
    return PAD_Y + STRING_GAP * idx;
  }

  function fretX(fret: number): number {
    if (fret === 0) return PAD_L - 20;
    return PAD_L + FRET_W * (fret - 0.5);
  }

  return (
    <div className="flex flex-col gap-4">
      {activeSectionId === null && sections.length > 1 && (
        <p className="text-xs text-stone-500">
          Showing {activeSection.name}. Pick a loop to focus on another section.
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-amber-50/40 p-3">
        <svg
          viewBox={`0 0 ${WIDTH} ${height + 24}`}
          className="w-full min-w-[640px]"
          role="img"
          aria-label={`Fretboard sequence for ${activeSection.name}`}
        >
          <rect
            x={PAD_L}
            y={PAD_Y - 10}
            width={FRET_W * FRET_COUNT}
            height={STRING_GAP * (stringOrder.length - 1) + 20}
            fill="#fffbeb"
          />

          {Array.from({ length: FRET_COUNT + 1 }, (_, i) => {
            const x = PAD_L + FRET_W * i;
            const isNut = i === 0;
            return (
              <line
                key={`fret-${i}`}
                x1={x}
                x2={x}
                y1={PAD_Y - 10}
                y2={height - PAD_Y + 10}
                stroke={isNut ? "#1f2937" : "#d4d4d8"}
                strokeWidth={isNut ? 4 : 1.2}
              />
            );
          })}

          {FRET_MARKERS.map((f) => (
            <circle
              key={`m-${f}`}
              cx={PAD_L + FRET_W * (f - 0.5)}
              cy={height / 2}
              r={4}
              fill="#e7e5e4"
            />
          ))}
          {DOUBLE_FRET_MARKERS.map((f) => (
            <g key={`dm-${f}`}>
              <circle
                cx={PAD_L + FRET_W * (f - 0.5)}
                cy={PAD_Y + STRING_GAP * 0.5}
                r={4}
                fill="#e7e5e4"
              />
              <circle
                cx={PAD_L + FRET_W * (f - 0.5)}
                cy={PAD_Y + STRING_GAP * 2.5}
                r={4}
                fill="#e7e5e4"
              />
            </g>
          ))}

          {stringOrder.map((s, i) => (
            <g key={`string-${s}`}>
              <line
                x1={PAD_L - 24}
                x2={WIDTH - PAD_R / 2}
                y1={PAD_Y + STRING_GAP * i}
                y2={PAD_Y + STRING_GAP * i}
                stroke="#52525b"
                strokeWidth={1.2 + (stringOrder.length - 1 - i) * 0.4}
              />
              <text
                x={8}
                y={PAD_Y + STRING_GAP * i + 4}
                className="fill-stone-500"
                fontSize={12}
                fontWeight={600}
              >
                {s}
              </text>
            </g>
          ))}

          {[3, 5, 7, 9, 12].map((f) => (
            <text
              key={`flabel-${f}`}
              x={PAD_L + FRET_W * (f - 0.5)}
              y={height + 8}
              textAnchor="middle"
              className="fill-stone-400"
              fontSize={11}
            >
              {f}
            </text>
          ))}

          {notes.map((note) => {
            if (!note.string || note.fret === undefined) return null;
            const isCurrent = highlightedIndex === note.index;
            const cx = fretX(note.fret);
            const cy = stringY(note.string);
            const seqIdx =
              notes.findIndex((n) => n.index === note.index) + 1;
            return (
              <g
                key={`note-${note.index}`}
                onClick={() =>
                  onSelect(
                    selection?.sectionId === activeSection.sectionId &&
                      selection?.eventIndex === note.index
                      ? null
                      : {
                          sectionId: activeSection.sectionId,
                          eventIndex: note.index,
                        },
                  )
                }
                className="cursor-pointer"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isCurrent ? 14 : 10}
                  fill={isCurrent ? "#d97706" : "#ffffff"}
                  stroke={isCurrent ? "#92400e" : "#a8a29e"}
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                />
                <text
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  fontSize={isCurrent ? 11 : 10}
                  fontWeight={700}
                  className={isCurrent ? "fill-white" : "fill-stone-600"}
                  style={{ pointerEvents: "none" }}
                >
                  {seqIdx}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <Scrubber
        totalSubs={activeSection.totalSubs}
        currentSub={currentSub}
        events={notes}
        highlightedIndex={highlightedIndex}
      />
    </div>
  );
}

function Scrubber({
  totalSubs,
  currentSub,
  events,
  highlightedIndex,
}: {
  totalSubs: number;
  currentSub: number | null;
  events: NoteEvent[];
  highlightedIndex: number | null;
}) {
  const pct = currentSub === null ? 0 : (currentSub / totalSubs) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-2 w-full rounded-full bg-stone-200">
        {events.map((e) => (
          <span
            key={`tick-${e.index}`}
            className={`absolute top-1/2 h-3 w-[2px] -translate-y-1/2 ${
              highlightedIndex === e.index
                ? "bg-amber-700"
                : "bg-stone-400"
            }`}
            style={{ left: `${(e.startSub / totalSubs) * 100}%` }}
          />
        ))}
        {currentSub !== null && (
          <span
            className="absolute top-1/2 h-4 w-[3px] -translate-y-1/2 rounded bg-amber-600"
            style={{ left: `${pct}%` }}
          />
        )}
      </div>
      <p className="text-xs text-stone-500">
        Each circle is a note in order — the number is when it plays. Click a
        note to pin it, or let the timer drive the highlight.
      </p>
    </div>
  );
}

function findEventAt(events: NoteEvent[], sub: number): number | null {
  for (const e of events) {
    if (sub >= e.startSub && sub < e.startSub + e.span) return e.index;
  }
  return null;
}
