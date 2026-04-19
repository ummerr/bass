"use client";

import type { TabLoop } from "@/lib/tabs/parse";

type Props = {
  tabLines: string[];
  tabStart: number;
  activeLoop: TabLoop | null;
  isPlaying: boolean;
  iteration: number;
};

export function AsciiView({
  tabLines,
  tabStart,
  activeLoop,
  isPlaying,
  iteration,
}: Props) {
  return (
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
  );
}
