"use client";

import { useState } from "react";
import { NOTES, type Note, semitoneDistance } from "@/lib/music/notes";
import {
  SCALE_LABELS,
  scaleDegree,
  type ScaleName,
} from "@/lib/music/scales";
import { intervalName } from "@/lib/music/intervals";
import {
  STANDARD_BASS_TUNING,
  DEFAULT_FRET_COUNT,
  FRET_MARKERS,
  DOUBLE_FRET_MARKERS,
  buildFretboard,
} from "@/lib/music/fretboard";

type LabelMode = "note" | "degree" | "interval";
type ScaleOption = "all" | ScaleName;

type Preset = {
  id: string;
  label: string;
  root: Note;
  scale: ScaleOption;
};

const PRESETS: Preset[] = [
  { id: "all", label: "All notes", root: "E", scale: "all" },
  { id: "c-major", label: "C major", root: "C", scale: "major" },
  { id: "a-minor", label: "A minor", root: "A", scale: "natural-minor" },
  {
    id: "e-minor-pent",
    label: "E minor pentatonic",
    root: "E",
    scale: "pentatonic-minor",
  },
];

const SCALE_LABELS_EXT: Record<ScaleOption, string> = {
  all: "All notes",
  ...SCALE_LABELS,
};

const INTERVAL_COLORS: Record<number, string> = {
  0: "#e11d48",
  1: "#94a3b8",
  2: "#f59e0b",
  3: "#6366f1",
  4: "#10b981",
  5: "#0ea5e9",
  6: "#737373",
  7: "#f97316",
  8: "#64748b",
  9: "#14b8a6",
  10: "#8b5cf6",
  11: "#ec4899",
};

const NEUTRAL_NOTE = "#57534e";
const ROOT_COLOR = "#e11d48";

const FRET_COUNT = DEFAULT_FRET_COUNT;
const FRET_W = 56;
const STRING_GAP = 40;
const PAD_L = 44;
const PAD_R = 24;
const PAD_Y = 32;
const STRING_COUNT = STANDARD_BASS_TUNING.length;
const WIDTH = PAD_L + PAD_R + FRET_W * FRET_COUNT;
const HEIGHT = PAD_Y * 2 + STRING_GAP * (STRING_COUNT - 1);

function fretX(fret: number): number {
  if (fret === 0) return PAD_L - 24;
  return PAD_L + FRET_W * (fret - 0.5);
}

function stringY(stringIdx: number): number {
  return PAD_Y + STRING_GAP * stringIdx;
}

function presetById(id: string | undefined): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

function matchPreset(root: Note, scale: ScaleOption): string | null {
  const hit = PRESETS.find((p) => p.root === root && p.scale === scale);
  return hit?.id ?? null;
}

export default function FretboardExplorer({
  initialPresetId,
}: {
  initialPresetId?: string;
}) {
  const initial = presetById(initialPresetId);
  const [root, setRoot] = useState<Note>(initial.root);
  const [scale, setScale] = useState<ScaleOption>(initial.scale);
  const [labelMode, setLabelMode] = useState<LabelMode>("note");
  const [advanced, setAdvanced] = useState(false);

  const fretboard = buildFretboard(STANDARD_BASS_TUNING, FRET_COUNT);
  const activePreset = matchPreset(root, scale);

  function noteLabel(note: Note, semis: number): string {
    if (!advanced || labelMode === "note") return note;
    if (labelMode === "interval") return intervalName(semis);
    if (scale === "all") return note;
    const degree = scaleDegree(root, scale, note);
    return degree === null ? note : String(degree);
  }

  function dotColor(semis: number, isRoot: boolean): string {
    if (isRoot) return ROOT_COLOR;
    if (!advanced) return NEUTRAL_NOTE;
    return INTERVAL_COLORS[semis];
  }

  function applyPreset(p: Preset) {
    setRoot(p.root);
    setScale(p.scale);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-stone-500">
          Show
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <Pill
              key={p.id}
              active={activePreset === p.id}
              onClick={() => applyPreset(p)}
            >
              {p.label}
            </Pill>
          ))}
          {activePreset === null && (
            <span className="self-center text-xs text-stone-500">
              Custom
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="text-xs uppercase tracking-wider text-stone-500 underline-offset-4 hover:text-stone-800 hover:underline"
        >
          {advanced ? "Hide advanced ↑" : "Show advanced ↓"}
        </button>
      </div>

      {advanced && (
        <div className="flex flex-col gap-5 rounded-lg border border-stone-200 bg-amber-50/60 p-4">
          <ControlGroup label="Root">
            {NOTES.map((n) => (
              <Pill key={n} active={root === n} onClick={() => setRoot(n)}>
                {n}
              </Pill>
            ))}
          </ControlGroup>
          <ControlGroup label="Scale">
            {(["all", ...Object.keys(SCALE_LABELS)] as ScaleOption[]).map(
              (s) => (
                <Pill
                  key={s}
                  active={scale === s}
                  onClick={() => setScale(s)}
                >
                  {SCALE_LABELS_EXT[s]}
                </Pill>
              ),
            )}
          </ControlGroup>
          <ControlGroup label="Label notes as">
            {(["note", "degree", "interval"] as LabelMode[]).map((m) => (
              <Pill
                key={m}
                active={labelMode === m}
                onClick={() => setLabelMode(m)}
              >
                <span className="capitalize">{m}</span>
              </Pill>
            ))}
          </ControlGroup>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT + 24}`}
          className="w-full min-w-[720px]"
          role="img"
          aria-label={`${root} ${SCALE_LABELS_EXT[scale]} on bass fretboard`}
        >
          <rect
            x={PAD_L}
            y={PAD_Y - 10}
            width={FRET_W * FRET_COUNT}
            height={STRING_GAP * (STRING_COUNT - 1) + 20}
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
                y2={HEIGHT - PAD_Y + 10}
                stroke={isNut ? "#1f2937" : "#d4d4d8"}
                strokeWidth={isNut ? 5 : 1.5}
              />
            );
          })}

          {FRET_MARKERS.filter((f) => f <= FRET_COUNT).map((f) => (
            <circle
              key={`m-${f}`}
              cx={PAD_L + FRET_W * (f - 0.5)}
              cy={HEIGHT / 2}
              r={5}
              fill="#e7e5e4"
            />
          ))}
          {DOUBLE_FRET_MARKERS.filter((f) => f <= FRET_COUNT).map((f) => (
            <g key={`dm-${f}`}>
              <circle
                cx={PAD_L + FRET_W * (f - 0.5)}
                cy={PAD_Y + STRING_GAP * 0.5}
                r={5}
                fill="#e7e5e4"
              />
              <circle
                cx={PAD_L + FRET_W * (f - 0.5)}
                cy={PAD_Y + STRING_GAP * 2.5}
                r={5}
                fill="#e7e5e4"
              />
            </g>
          ))}

          {STANDARD_BASS_TUNING.map((open, i) => (
            <g key={`string-${i}`}>
              <line
                x1={PAD_L - 28}
                x2={WIDTH - PAD_R / 2}
                y1={stringY(i)}
                y2={stringY(i)}
                stroke="#52525b"
                strokeWidth={1.4 + i * 0.5}
              />
              <text
                x={8}
                y={stringY(i) + 4}
                className="fill-stone-500"
                fontSize={12}
                fontWeight={600}
              >
                {open}
              </text>
            </g>
          ))}

          {[3, 5, 7, 9, 12].filter((f) => f <= FRET_COUNT).map((f) => (
            <text
              key={`flabel-${f}`}
              x={PAD_L + FRET_W * (f - 0.5)}
              y={HEIGHT + 10}
              textAnchor="middle"
              className="fill-stone-400"
              fontSize={11}
            >
              {f}
            </text>
          ))}

          {fretboard.map((stringNotes, sIdx) =>
            stringNotes.map((note, fIdx) => {
              const semis = semitoneDistance(root, note);
              const inScale =
                scale === "all" || scaleDegree(root, scale, note) !== null;
              if (!inScale) return null;
              const isRoot = semis === 0;
              const cx = fretX(fIdx);
              const cy = stringY(sIdx);
              return (
                <g key={`n-${sIdx}-${fIdx}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isRoot ? 15 : 13}
                    fill={dotColor(semis, isRoot)}
                    stroke={isRoot ? "#111827" : "#ffffff"}
                    strokeWidth={isRoot ? 2.5 : 1.5}
                  />
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    className="fill-white"
                    fontSize={11}
                    fontWeight={700}
                    style={{ pointerEvents: "none" }}
                  >
                    {noteLabel(note, semis)}
                  </text>
                </g>
              );
            }),
          )}
        </svg>
      </div>

      <p className="text-xs text-stone-500">
        4-string tuning, top to bottom: G, D, A, E · frets 0–{FRET_COUNT}
      </p>
    </div>
  );
}

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wider text-stone-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({
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
