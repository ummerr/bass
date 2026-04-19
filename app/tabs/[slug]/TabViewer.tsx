"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Tab } from "@/lib/tabs/parse";
import type { BassString } from "@/lib/tabs/schema";
import {
  renderGrid,
  STRINGS_HIGH_TO_LOW,
  STRINGS_LOW_TO_HIGH,
  type SectionGrid,
} from "@/lib/tabs/render-grid";
import { OrientationLegend } from "./OrientationLegend";
import { AsciiView } from "./AsciiView";
import { BeatGrid, type BeatGridSelection } from "./BeatGrid";
import { FretboardSequence } from "./FretboardSequence";

const DURATION_KEY = "tab-viewer:durationSec";
const FLIP_KEY = "tab-viewer:flipOrientation";

type ViewMode = "grid" | "ascii" | "fretboard";

function splitBody(lines: string[]): { prose: string; tabStart: number } {
  const firstTab = lines.findIndex((l) => /^\s*[A-Ga-g]\|/.test(l));
  if (firstTab === -1) return { prose: "", tabStart: 0 };
  const proseLines = lines.slice(0, firstTab);
  while (
    proseLines.length &&
    proseLines[proseLines.length - 1].trim() === ""
  ) {
    proseLines.pop();
  }
  return { prose: proseLines.join("\n").trim(), tabStart: firstTab };
}

export function TabViewer({ tab }: { tab: Tab }) {
  const { prose, tabStart } = splitBody(tab.lines);
  const tabLines = tab.lines.slice(tabStart);
  const isStructured = Boolean(tab.structured);
  const sections = useMemo<SectionGrid[] | null>(
    () => (tab.structured ? renderGrid(tab.structured) : null),
    [tab.structured],
  );
  const hasLoops = tab.loops.length > 0;

  const [view, setView] = useState<ViewMode>(isStructured ? "grid" : "ascii");
  const [selectedLoopIndex, setSelectedLoopIndex] = useState<number | null>(
    hasLoops ? 0 : null,
  );
  const [durationSec, setDurationSec] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [iteration, setIteration] = useState(0);
  const [flipOrientation, setFlipOrientation] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selection, setSelection] = useState<BeatGridSelection>(null);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const d = window.localStorage.getItem(DURATION_KEY);
    if (d) {
      const n = Number(d);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Number.isFinite(n) && n >= 5 && n <= 60) setDurationSec(n);
    }
    const f = window.localStorage.getItem(FLIP_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (f === "1") setFlipOrientation(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    startRef.current = null;
    const durationMs = durationSec * 1000;
    function tick(now: number) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      if (elapsed >= durationMs) {
        startRef.current = now;
        setProgress(0);
        setIteration((i) => i + 1);
      } else {
        setProgress(elapsed / durationMs);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, durationSec]);

  const activeLoop =
    selectedLoopIndex !== null && tab.loops[selectedLoopIndex]
      ? tab.loops[selectedLoopIndex]
      : null;
  const activeSectionId = activeLoop?.sectionId ?? null;
  const activeSection =
    (sections && activeSectionId
      ? sections.find((s) => s.sectionId === activeSectionId) ?? null
      : sections && sections[0]) ?? null;
  const currentSub =
    isPlaying && activeSection
      ? Math.min(
          activeSection.totalSubs - 1,
          Math.floor(progress * activeSection.totalSubs),
        )
      : null;

  const stringOrder: BassString[] = flipOrientation
    ? STRINGS_LOW_TO_HIGH
    : STRINGS_HIGH_TO_LOW;

  const flashIteration = isPlaying && activeLoop ? iteration : 0;

  function handleDurationChange(value: number) {
    setDurationSec(value);
    window.localStorage.setItem(DURATION_KEY, String(value));
  }

  function handleFlip(next: boolean) {
    setFlipOrientation(next);
    window.localStorage.setItem(FLIP_KEY, next ? "1" : "0");
  }

  function resetAll() {
    setIsPlaying(false);
    setProgress(0);
    setIteration(0);
    startRef.current = null;
  }

  function changeLoop(value: string) {
    setSelectedLoopIndex(value === "all" ? null : Number(value));
    setSelection(null);
    resetAll();
  }

  const currentView: ViewMode = isStructured ? view : "ascii";

  return (
    <div className="flex flex-col gap-4">
      {prose && <p className="text-stone-600">{prose}</p>}

      <div className="h-1 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full bg-amber-600"
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>

      <OrientationLegend order={stringOrder} flipped={flipOrientation} />

      {isStructured && (
        <div
          className="flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="Tab view"
        >
          <ViewTab active={view === "grid"} onClick={() => setView("grid")}>
            Beat grid
          </ViewTab>
          <ViewTab active={view === "ascii"} onClick={() => setView("ascii")}>
            ASCII
          </ViewTab>
          <ViewTab
            active={view === "fretboard"}
            onClick={() => setView("fretboard")}
          >
            Fretboard
          </ViewTab>
        </div>
      )}

      {currentView === "grid" && sections && (
        <BeatGrid
          sections={sections}
          stringOrder={stringOrder}
          activeSectionId={activeSectionId}
          currentSub={currentSub}
          selection={selection}
          onSelect={setSelection}
          flashIteration={flashIteration}
        />
      )}
      {currentView === "fretboard" && sections && (
        <FretboardSequence
          sections={sections}
          stringOrder={stringOrder}
          activeSectionId={activeSectionId}
          currentSub={currentSub}
          selection={selection}
          onSelect={setSelection}
        />
      )}
      {currentView === "ascii" && (
        <AsciiView
          tabLines={tabLines}
          tabStart={tabStart}
          activeLoop={activeLoop}
          isPlaying={isPlaying}
          iteration={iteration}
        />
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 bg-white p-3">
        {hasLoops && (
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <span className="text-xs uppercase tracking-wider text-stone-500">
              Loop
            </span>
            <select
              value={selectedLoopIndex ?? "all"}
              onChange={(e) => changeLoop(e.target.value)}
              className="rounded-md border border-stone-200 bg-white px-2 py-1"
            >
              <option value="all">All lines</option>
              {tab.loops.map((loop, i) => (
                <option key={loop.name} value={i}>
                  {loop.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={() => setIsPlaying((v) => !v)}
          className="inline-flex items-center rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-900 hover:border-stone-900"
        >
          Reset
        </button>

        <label className="ml-auto flex items-center gap-2 text-sm text-stone-700">
          <span className="text-xs uppercase tracking-wider text-stone-500">
            Timer
          </span>
          <input
            type="range"
            min={5}
            max={60}
            step={1}
            value={durationSec}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            aria-label="Loop duration in seconds"
          />
          <span className="w-10 text-right tabular-nums">{durationSec}s</span>
        </label>
      </div>

      {isStructured && (
        <div className="rounded-lg border border-stone-200 bg-white">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-stone-500 hover:text-stone-800"
            aria-expanded={advancedOpen}
          >
            <span>
              {advancedOpen ? "Hide advanced ↑" : "Show advanced ↓"}
            </span>
          </button>
          {advancedOpen && (
            <div className="border-t border-stone-200 px-4 py-3">
              <label className="flex items-start gap-3 text-sm text-stone-700">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={flipOrientation}
                  onChange={(e) => handleFlip(e.target.checked)}
                />
                <span>
                  <span className="block">
                    Flip orientation — show as my bass looks from above
                  </span>
                  <span className="mt-1 block text-xs text-stone-500">
                    Puts E on top (the string closest to your chest).
                  </span>
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-stone-500">
        Play the phrase silently, along with the timer. When the bar fills and
        the first beat flashes, start the loop again. The goal is to feel the
        phrase — not to race.
      </p>
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? "rounded-md border border-stone-900 bg-stone-900 px-3 py-1.5 text-sm text-white transition"
          : "rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition hover:border-stone-500"
      }
    >
      {children}
    </button>
  );
}
