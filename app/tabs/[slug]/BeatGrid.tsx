"use client";

import type { BassString } from "@/lib/tabs/schema";
import {
  SUBS_PER_BAR,
  SUBS_PER_BEAT,
  type GridCell,
  type SectionGrid,
} from "@/lib/tabs/render-grid";

export type BeatGridSelection = {
  sectionId: string;
  eventIndex: number;
} | null;

type Props = {
  sections: SectionGrid[];
  stringOrder: BassString[];
  activeSectionId: string | null;
  currentSub: number | null;
  selection: BeatGridSelection;
  onSelect: (sel: BeatGridSelection) => void;
  flashIteration: number;
};

export function BeatGrid({
  sections,
  stringOrder,
  activeSectionId,
  currentSub,
  selection,
  onSelect,
  flashIteration,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => {
        const isActive =
          activeSectionId === null || activeSectionId === section.sectionId;
        const liveSub = isActive ? currentSub : null;
        const currentEventIndex =
          liveSub === null
            ? null
            : findEventAt(section, liveSub);
        return (
          <SectionTable
            key={section.sectionId}
            section={section}
            stringOrder={stringOrder}
            dim={!isActive}
            currentSub={liveSub}
            currentEventIndex={currentEventIndex}
            selection={
              selection && selection.sectionId === section.sectionId
                ? selection
                : null
            }
            flashIteration={isActive ? flashIteration : 0}
            onSelect={(eventIndex) =>
              onSelect(
                selection?.sectionId === section.sectionId &&
                  selection?.eventIndex === eventIndex
                  ? null
                  : { sectionId: section.sectionId, eventIndex },
              )
            }
          />
        );
      })}
    </div>
  );
}

function findEventAt(section: SectionGrid, sub: number): number | null {
  for (const e of section.events) {
    if (sub >= e.startSub && sub < e.startSub + e.span) return e.index;
  }
  return null;
}

function SectionTable({
  section,
  stringOrder,
  dim,
  currentSub,
  currentEventIndex,
  selection,
  flashIteration,
  onSelect,
}: {
  section: SectionGrid;
  stringOrder: BassString[];
  dim: boolean;
  currentSub: number | null;
  currentEventIndex: number | null;
  selection: BeatGridSelection;
  flashIteration: number;
  onSelect: (eventIndex: number) => void;
}) {
  const colIndices = Array.from({ length: section.totalSubs }, (_, i) => i);

  return (
    <div className={dim ? "opacity-40 transition-opacity" : "transition-opacity"}>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
          {section.name}
        </h3>
        <span className="text-[11px] text-stone-400">
          {section.barCount} bar{section.barCount > 1 ? "s" : ""}
        </span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white p-3">
        <table className="border-collapse font-mono text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 w-8 bg-white" aria-label="string" />
              {colIndices.map((i) => {
                const beatStart = i % SUBS_PER_BEAT === 0;
                const barStart = i % SUBS_PER_BAR === 0 && i !== 0;
                const beatNum = (i % SUBS_PER_BAR) / SUBS_PER_BEAT + 1;
                return (
                  <th
                    key={i}
                    className={`w-6 pb-1 text-[10px] font-normal text-stone-400 ${
                      barStart ? "border-l-2 border-l-stone-400" : ""
                    }`}
                  >
                    {beatStart ? beatNum : ""}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {stringOrder.map((s) => {
              const row = section.rows.find((r) => r.string === s);
              if (!row) return null;
              return (
                <tr key={s}>
                  <th
                    scope="row"
                    className="sticky left-0 w-8 bg-white pr-2 text-right text-xs font-semibold text-stone-500"
                  >
                    {s}
                  </th>
                  {row.cells.map((cell, i) => {
                    const barStart = i % SUBS_PER_BAR === 0 && i !== 0;
                    const beatStart = i % SUBS_PER_BEAT === 0 && !barStart;
                    const isCurrentCol = currentSub === i;
                    const eventIndex =
                      cell.kind === "onset" || cell.kind === "tie"
                        ? cell.eventIndex
                        : null;
                    const isSelected =
                      eventIndex !== null &&
                      selection?.eventIndex === eventIndex;
                    const nowPlaying =
                      eventIndex !== null &&
                      currentEventIndex === eventIndex;
                    const clickable = cell.kind === "onset";
                    const flashing = i === 0 && flashIteration > 0;

                    return (
                      <td
                        key={flashing ? `${i}-f${flashIteration}` : i}
                        onClick={
                          clickable && eventIndex !== null
                            ? () => onSelect(eventIndex)
                            : undefined
                        }
                        className={[
                          "h-8 w-6 p-0 text-center align-middle",
                          barStart ? "border-l-2 border-l-stone-400" : "",
                          beatStart ? "border-l border-l-stone-200" : "",
                          isCurrentCol ? "bg-amber-100" : "",
                          flashing ? "animate-tab-flash" : "",
                          clickable ? "cursor-pointer" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <CellGlyph
                          cell={cell}
                          highlighted={isSelected}
                          nowPlaying={nowPlaying}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CellGlyph({
  cell,
  highlighted,
  nowPlaying,
}: {
  cell: GridCell;
  highlighted: boolean;
  nowPlaying: boolean;
}) {
  if (cell.kind === "empty" || cell.kind === "rest") {
    return <span className="text-stone-200">·</span>;
  }
  if (cell.kind === "tie") {
    return (
      <span
        className={`block h-[2px] w-full ${
          highlighted || nowPlaying ? "bg-amber-500" : "bg-stone-300"
        }`}
        aria-hidden
      />
    );
  }
  return (
    <span
      className={[
        "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold tabular-nums",
        highlighted
          ? "bg-stone-900 text-white ring-2 ring-amber-500"
          : nowPlaying
            ? "bg-amber-500 text-white"
            : "bg-amber-100 text-amber-900",
      ].join(" ")}
    >
      {cell.fret}
    </span>
  );
}
