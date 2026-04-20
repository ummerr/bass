"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Tab } from "@/lib/tabs/parse";
import { TabViewer } from "@/app/tabs/[slug]/TabViewer";

type ProseStep = {
  kind: "prose";
  title: string;
  body: string;
};

type DrillStep = {
  kind: "drill";
  title: string;
  body: string;
  loopName: string;
  durationSec: number;
};

type Step = ProseStep | DrillStep;

const STEPS: Step[] = [
  {
    kind: "prose",
    title: "What you're learning",
    body:
      "This riff is in 7/4 — seven beats per bar, not four. Count 1-2-3-4-5-6-7 out loud and accent beats 1 and 5. The plan: three tiny warm-ups, four chunks of the riff, then the full thing — slow, silent, one loop at a time. Don't worry about speed yet.",
  },
  {
    kind: "drill",
    title: "Warm up your plucking hand",
    body:
      "60 seconds of open E plucks. Alternate index and middle fingers on your right hand. No fretting hand yet — just get the right-hand rhythm steady.",
    loopName: "Warm-up — open E alternation",
    durationSec: 60,
  },
  {
    kind: "drill",
    title: "Warm up a slide",
    body:
      "A slide is one motion: keep the finger pressing down and glide along the string. Don't lift. Try 5→7, then 5→10, then 5→12 on the A string.",
    loopName: "Warm-up — slide drill",
    durationSec: 45,
  },
  {
    kind: "drill",
    title: "Practice the ghost note at fret 3",
    body:
      "A ghost note (the parenthesised (3)) is a muted click, not a pitch. Touch the string with your fretting finger but don't press to the fretboard. You should hear a percussive tap, no note. You'll use this exact fret-3 ghost in Chunk 3.",
    loopName: "Warm-up — ghost note at fret 3",
    durationSec: 45,
  },
  {
    kind: "drill",
    title: "Chunk 1 — the opening",
    body:
      "Open E twice, then fret 7 on A, then fret 5 on D, a quick climb on the E string. Your left hand stays near the nut. Take your time.",
    loopName: "Chunk 1 — opening",
    durationSec: 60,
  },
  {
    kind: "drill",
    title: "Chunk 2 — climb to fret 12",
    body:
      "Here the hand moves up the neck. Shift the whole hand — thumb follows along the back of the neck. The reach to fret 12 is the furthest you'll go.",
    loopName: "Chunk 2 — climb to fret 12",
    durationSec: 60,
  },
  {
    kind: "drill",
    title: "Chunk 3 — the slide + ghost",
    body:
      "The hard part. Fret 10 on the E string, then slide all the way down to fret 3. After landing on 3, the next note is a ghost at the same fret — touch, don't press. Then slide back up. Expect this to feel wrong for the first 10 tries.",
    loopName: "Chunk 3 — slide + ghost",
    durationSec: 60,
  },
  {
    kind: "drill",
    title: "Chunk 4 — descent",
    body:
      "Working back down: fret 12 on D, fret 10 on A, fret 10 on E, then small steps back to the start. Short chunk — loop it until your hand knows the path.",
    loopName: "Chunk 4 — descent",
    durationSec: 60,
  },
  {
    kind: "drill",
    title: "Full riff — slow",
    body:
      "Chain all four chunks. Count 1-2-3-4-5-6-7 out loud through each pass. It will fall apart the first several tries — that's the whole point. Reset and go again.",
    loopName: "Full riff (slow)",
    durationSec: 60,
  },
  {
    kind: "prose",
    title: "When it's solid",
    body:
      "Drop the timer to 30 seconds, then 20, then 15 — that's roughly speeding up. Come back three days in a row before deciding you've got it; muscle memory needs sleep to lock in. Don't forget to log today's practice.",
  },
];

const COMPLETED_KEY = "learn:fabienk:completed";

export function LearnFabienk({ tab }: { tab: Tab }) {
  const [activeLoopName, setActiveLoopName] = useState<string | undefined>(
    undefined,
  );
  const [activeDurationSec, setActiveDurationSec] = useState<number>(60);
  const [completed, setCompleted] = useState<Set<number>>(() => new Set());
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COMPLETED_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCompleted(new Set(arr.filter((n) => typeof n === "number")));
      }
    } catch {
      // ignore malformed localStorage
    }
  }, []);

  function toggleCompleted(i: number) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      window.localStorage.setItem(
        COMPLETED_KEY,
        JSON.stringify(Array.from(next)),
      );
      return next;
    });
  }

  function loadDrill(step: DrillStep) {
    setActiveLoopName(step.loopName);
    setActiveDurationSec(step.durationSec);
    viewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col gap-8">
      <div ref={viewerRef} className="md:sticky md:top-4 md:z-10 md:bg-[var(--background,#faf6ee)]/95 md:pt-2 md:pb-2">
        <TabViewer
          tab={tab}
          initialLoopName={activeLoopName}
          initialDurationSec={activeDurationSec}
        />
      </div>

      <ol className="flex flex-col gap-4">
        {STEPS.map((step, i) => {
          const isDone = completed.has(i);
          return (
            <li
              key={i}
              className={`rounded-xl border border-stone-200 bg-white p-5 ${
                isDone ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleCompleted(i)}
                  aria-label={`Mark step ${i + 1} complete`}
                  className="mt-1.5 h-4 w-4 shrink-0 accent-amber-700"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold tracking-tight">
                    <span className="text-stone-400 tabular-nums">
                      {String(i + 1).padStart(2, "0")}.
                    </span>{" "}
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-stone-700 leading-relaxed">
                    {step.body}
                  </p>
                  {step.kind === "drill" && (
                    <button
                      type="button"
                      onClick={() => loadDrill(step)}
                      className="mt-3 inline-flex items-center rounded-md bg-amber-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-800"
                    >
                      Load this drill · {step.durationSec}s loop
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-stone-200 bg-[var(--key-tint)] p-5">
        <h3 className="text-sm uppercase tracking-wider text-stone-500">
          Finish the session
        </h3>
        <p className="mt-2 text-stone-700">
          Commit one line to your streak — it&apos;s how the site tracks that
          you showed up.
        </p>
        <Link
          href="/log"
          className="mt-3 inline-flex items-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Log today&apos;s practice →
        </Link>
      </div>
    </div>
  );
}
