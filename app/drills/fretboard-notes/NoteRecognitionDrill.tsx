"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NOTES, type Note } from "@/lib/music/notes";
import { fretNote } from "@/lib/music/fretboard";

type StringName = "E" | "A" | "D" | "G";
type Mode = "name-to-fret" | "fret-to-name";

const STRING_OPTIONS: { name: StringName; openNote: Note }[] = [
  { name: "E", openNote: "E" },
  { name: "A", openNote: "A" },
  { name: "D", openNote: "D" },
  { name: "G", openNote: "G" },
];

const FRETS = 12;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type NameToFretPrompt = { kind: "name-to-fret"; target: Note };
type FretToNamePrompt = { kind: "fret-to-name"; fret: number; target: Note };
type Prompt = NameToFretPrompt | FretToNamePrompt;

function buildPrompts(mode: Mode, openNote: Note): Prompt[] {
  if (mode === "name-to-fret") {
    return shuffle([...NOTES]).map((target) => ({
      kind: "name-to-fret" as const,
      target,
    }));
  }
  const frets = shuffle(Array.from({ length: FRETS }, (_, i) => i + 1));
  return frets.slice(0, 12).map((fret) => ({
    kind: "fret-to-name" as const,
    fret,
    target: fretNote(openNote, fret),
  }));
}

type Feedback =
  | { kind: "idle" }
  | { kind: "correct" }
  | { kind: "wrong"; shownFret?: number };

type StartingConfig = { string: StringName; mode: Mode };

export function NoteRecognitionDrill({
  initialString,
}: {
  initialString: StringName;
}) {
  const [config, setConfig] = useState<StartingConfig>({
    string: initialString,
    mode: "name-to-fret",
  });
  const openNote = STRING_OPTIONS.find((s) => s.name === config.string)!
    .openNote;
  const [prompts, setPrompts] = useState<Prompt[]>(() =>
    buildPrompts(config.mode, openNote),
  );
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle" });
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  function reset(next: StartingConfig) {
    const opens = STRING_OPTIONS.find((s) => s.name === next.string)!.openNote;
    setConfig(next);
    setPrompts(buildPrompts(next.mode, opens));
    setIndex(0);
    setResults([]);
    setFeedback({ kind: "idle" });
    setStartedAt(Date.now());
    setElapsedMs(null);
  }

  function record(correct: boolean, shownFret?: number) {
    if (feedback.kind !== "idle") return;
    const nextResults = [...results, correct];
    setResults(nextResults);
    setFeedback(
      correct ? { kind: "correct" } : { kind: "wrong", shownFret },
    );
    const delay = correct ? 500 : 1400;
    setTimeout(() => {
      if (nextResults.length >= prompts.length) {
        setElapsedMs(Date.now() - startedAt);
      } else {
        setIndex((i) => i + 1);
        setFeedback({ kind: "idle" });
      }
    }, delay);
  }

  const done = elapsedMs !== null;
  const current = prompts[index];
  const correctCount = results.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      <ConfigBar
        config={config}
        onChange={reset}
        disabled={feedback.kind !== "idle"}
      />

      {!done && current && (
        <>
          <Prompt
            prompt={current}
            openNote={openNote}
            feedback={feedback}
          />
          {current.kind === "name-to-fret" && (
            <SingleString
              openNote={openNote}
              onPick={(fret) => {
                const correct = fretNote(openNote, fret) === current.target;
                if (correct) record(true);
                else {
                  const correctFret = findFretForNote(openNote, current.target);
                  record(false, correctFret);
                }
              }}
              highlightFret={
                feedback.kind === "wrong" ? feedback.shownFret : undefined
              }
              disabled={feedback.kind !== "idle"}
            />
          )}
          {current.kind === "fret-to-name" && (
            <>
              <SingleString
                openNote={openNote}
                highlightFret={current.fret}
                disabled
              />
              <NoteButtons
                onPick={(note) => record(note === current.target)}
                correctNote={
                  feedback.kind === "wrong" ? current.target : undefined
                }
                disabled={feedback.kind !== "idle"}
              />
            </>
          )}
          <Progress index={index} total={prompts.length} correct={correctCount} />
        </>
      )}

      {done && (
        <ResultCard
          correct={correctCount}
          total={prompts.length}
          elapsedMs={elapsedMs!}
          onAgain={() => reset(config)}
        />
      )}
    </div>
  );
}

function findFretForNote(openNote: Note, target: Note): number {
  for (let f = 0; f <= FRETS; f++) {
    if (fretNote(openNote, f) === target) return f;
  }
  return 0;
}

function Prompt({
  prompt,
  openNote,
  feedback,
}: {
  prompt: Prompt;
  openNote: Note;
  feedback: Feedback;
}) {
  if (prompt.kind === "name-to-fret") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          Find this note on the {openNote} string
        </p>
        <p className="text-5xl font-bold tracking-tight text-neutral-900">
          {prompt.target}
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Say it out loud. Then tap the fret.
        </p>
        {feedback.kind === "correct" && (
          <p className="mt-1 text-sm font-medium text-emerald-700">Yes.</p>
        )}
        {feedback.kind === "wrong" && (
          <p className="mt-1 text-sm font-medium text-rose-700">
            That was fret {feedback.shownFret}.
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-6 text-center">
      <p className="text-xs uppercase tracking-widest text-neutral-500">
        Name the highlighted fret on the {openNote} string
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        Say it out loud. Then pick the note.
      </p>
      {feedback.kind === "correct" && (
        <p className="mt-1 text-sm font-medium text-emerald-700">Yes.</p>
      )}
      {feedback.kind === "wrong" && (
        <p className="mt-1 text-sm font-medium text-rose-700">
          That was {prompt.target}.
        </p>
      )}
    </div>
  );
}

function SingleString({
  openNote,
  highlightFret,
  onPick,
  disabled,
}: {
  openNote: Note;
  highlightFret?: number;
  onPick?: (fret: number) => void;
  disabled?: boolean;
}) {
  const cellW = 44;
  const h = 64;
  const width = cellW * (FRETS + 1);
  const markers = new Set([3, 5, 7, 9]);
  return (
    <svg
      width={width}
      height={h}
      viewBox={`0 0 ${width} ${h}`}
      className="max-w-full rounded-lg border border-neutral-200 bg-white"
      role="img"
      aria-label={`${openNote} string, 0 to ${FRETS} frets`}
    >
      <line
        x1={0}
        y1={h / 2}
        x2={width}
        y2={h / 2}
        stroke="#a8a29e"
        strokeWidth={2}
      />
      {Array.from({ length: FRETS + 1 }).map((_, f) => {
        const x = f * cellW;
        const centerX = x + cellW / 2;
        const isHighlighted = highlightFret === f;
        return (
          <g key={f}>
            {f > 0 && (
              <line
                x1={x}
                y1={8}
                x2={x}
                y2={h - 8}
                stroke="#e7e5e4"
                strokeWidth={1}
              />
            )}
            {markers.has(f) && (
              <circle cx={centerX} cy={h - 10} r={3} fill="#d6d3d1" />
            )}
            {f === 12 && (
              <>
                <circle cx={centerX - 6} cy={h - 10} r={3} fill="#d6d3d1" />
                <circle cx={centerX + 6} cy={h - 10} r={3} fill="#d6d3d1" />
              </>
            )}
            <rect
              x={x}
              y={0}
              width={cellW}
              height={h}
              fill={isHighlighted ? "#fef3c7" : "transparent"}
              stroke={isHighlighted ? "#d97706" : "none"}
              strokeWidth={isHighlighted ? 2 : 0}
              className={
                onPick && !disabled
                  ? "cursor-pointer hover:fill-neutral-100"
                  : undefined
              }
              onClick={onPick && !disabled ? () => onPick(f) : undefined}
            />
            <text
              x={centerX}
              y={h - 24}
              textAnchor="middle"
              fontSize={10}
              fill="#a8a29e"
              pointerEvents="none"
            >
              {f}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function NoteButtons({
  onPick,
  correctNote,
  disabled,
}: {
  onPick: (note: Note) => void;
  correctNote?: Note;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
      {NOTES.map((n) => {
        const isCorrect = correctNote === n;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onPick(n)}
            className={`rounded-md border px-2 py-2 text-sm font-medium transition ${
              isCorrect
                ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900 disabled:opacity-50"
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

function Progress({
  index,
  total,
  correct,
}: {
  index: number;
  total: number;
  correct: number;
}) {
  const pct = (index / total) * 100;
  return (
    <div className="flex items-center gap-3 text-xs text-neutral-500">
      <div className="h-1.5 flex-1 rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-neutral-900 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="tabular-nums">
        {index}/{total} · {correct} correct
      </span>
    </div>
  );
}

function ResultCard({
  correct,
  total,
  elapsedMs,
  onAgain,
}: {
  correct: number;
  total: number;
  elapsedMs: number;
  onAgain: () => void;
}) {
  const seconds = Math.round(elapsedMs / 1000);
  const pct = Math.round((correct / total) * 100);
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-white p-8 text-center">
      <p className="text-xs uppercase tracking-widest text-neutral-500">
        Done
      </p>
      <p className="text-5xl font-bold tracking-tight">
        {correct}
        <span className="text-2xl text-neutral-400">/{total}</span>
      </p>
      <p className="text-sm text-neutral-600">
        {pct}% · {seconds} seconds
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onAgain}
          className="inline-flex items-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

function ConfigBar({
  config,
  onChange,
  disabled,
}: {
  config: StartingConfig;
  onChange: (c: StartingConfig) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <fieldset className="flex items-center gap-2">
        <legend className="mr-1 text-xs uppercase tracking-wider text-neutral-500">
          String
        </legend>
        {STRING_OPTIONS.map((s) => (
          <button
            key={s.name}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...config, string: s.name })}
            className={`rounded-md px-2.5 py-1 text-sm font-medium transition ${
              config.string === s.name
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
            }`}
          >
            {s.name}
          </button>
        ))}
      </fieldset>
      <fieldset className="flex items-center gap-2">
        <legend className="mr-1 text-xs uppercase tracking-wider text-neutral-500">
          Mode
        </legend>
        {(
          [
            { v: "name-to-fret" as const, label: "Name → fret" },
            { v: "fret-to-name" as const, label: "Fret → name" },
          ]
        ).map((m) => (
          <button
            key={m.v}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...config, mode: m.v })}
            className={`rounded-md px-2.5 py-1 text-sm font-medium transition ${
              config.mode === m.v
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
            }`}
          >
            {m.label}
          </button>
        ))}
      </fieldset>
    </div>
  );
}
