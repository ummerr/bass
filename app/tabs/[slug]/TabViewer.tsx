"use client";

import { useEffect, useRef, useState } from "react";
import type { Tab } from "@/lib/tabs";

const DURATION_KEY = "tab-viewer:durationSec";

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
  const hasLoops = tab.loops.length > 0;

  const [selectedLoopIndex, setSelectedLoopIndex] = useState<number | null>(
    hasLoops ? 0 : null,
  );
  const [durationSec, setDurationSecState] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [iteration, setIteration] = useState(0);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(DURATION_KEY);
    if (!stored) return;
    const n = Number(stored);
    if (Number.isFinite(n) && n >= 5 && n <= 60) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDurationSecState(n);
    }
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

  function handleDurationChange(value: number) {
    setDurationSecState(value);
    window.localStorage.setItem(DURATION_KEY, String(value));
  }

  function resetAll() {
    setIsPlaying(false);
    setProgress(0);
    setIteration(0);
    startRef.current = null;
  }

  function changeLoop(value: string) {
    setSelectedLoopIndex(value === "all" ? null : Number(value));
    resetAll();
  }

  const activeLoop =
    selectedLoopIndex !== null && tab.loops[selectedLoopIndex]
      ? tab.loops[selectedLoopIndex]
      : null;

  return (
    <div className="flex flex-col gap-4">
      {prose && <p className="text-stone-600">{prose}</p>}

      <div className="h-1 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full bg-amber-600"
          style={{ width: `${(progress * 100).toFixed(2)}%` }}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-stone-900 p-4 font-mono text-[13px] leading-6 text-stone-100">
        {tabLines.map((line, i) => {
          const originalIndex = tabStart + i + 1;
          const inLoop =
            activeLoop !== null &&
            originalIndex >= activeLoop.startLine &&
            originalIndex <= activeLoop.endLine;
          const outOfLoop = activeLoop !== null && !inLoop;
          const isFirstOfLoop =
            activeLoop !== null && originalIndex === activeLoop.startLine;
          const shouldFlash = isFirstOfLoop && isPlaying && iteration > 0;
          return (
            <div
              key={`line-${originalIndex}`}
              className={`flex gap-3 ${
                outOfLoop ? "opacity-30" : "opacity-100"
              }`}
            >
              <span className="w-6 shrink-0 text-right text-stone-500 select-none">
                {originalIndex}
              </span>
              <span
                key={shouldFlash ? `flash-${iteration}` : "stable"}
                className={`flex-1 whitespace-pre ${
                  inLoop ? "bg-amber-500/10" : ""
                } ${shouldFlash ? "animate-tab-flash" : ""}`}
              >
                {line || " "}
              </span>
            </div>
          );
        })}
      </div>

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

      <p className="text-xs text-stone-500">
        Play the phrase silently, along with the timer. When the bar fills and
        the first line flashes, start the loop again. The goal is to feel the
        phrase — not to race.
      </p>
    </div>
  );
}
