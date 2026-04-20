#!/usr/bin/env tsx
import { auditTab } from "../lib/tabs/audit";
import type { StructuredTab } from "../lib/tabs/schema";

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`OK:   ${msg}`);
}

const clean: StructuredTab = {
  title: "Clean",
  artist: "Test",
  tuning: "EADG",
  key: "E minor",
  tempo: 120,
  difficulty: 1,
  techniques: [],
  startHere: false,
  sections: [
    {
      id: "main",
      name: "main",
      bars: [
        { bar: 1, beat: 1, sub: 0, dur: "1/4", string: "E", fret: 0 },
        { bar: 1, beat: 2, sub: 0, dur: "1/4", string: "E", fret: 3 },
        { bar: 1, beat: 3, sub: 0, dur: "1/4", string: "A", fret: 0 },
        { bar: 1, beat: 4, sub: 0, dur: "1/4", string: "A", fret: 2 },
      ],
    },
  ],
  loops: [],
  provenance: {
    sources: [
      { url: "https://a", retrieved: "2026-04-20" },
      { url: "https://b", retrieved: "2026-04-20" },
    ],
    agents: ["a1", "a2"],
    consensus: "unanimous",
    disagreements: [],
  },
};

const cleanReport = auditTab(clean);
assert(cleanReport.ok, "clean tab: ok=true");
assert(cleanReport.errors.length === 0, "clean tab: no errors");

const bigLeap: StructuredTab = {
  ...clean,
  sections: [
    {
      id: "main",
      name: "main",
      bars: [
        { bar: 1, beat: 1, sub: 0, dur: "1/4", string: "E", fret: 0 },
        { bar: 1, beat: 2, sub: 0, dur: "1/4", string: "E", fret: 15 },
      ],
    },
  ],
};
const leapReport = auditTab(bigLeap);
assert(
  leapReport.warnings.some((w) => w.rule === "leap"),
  "big leap warning fires on 15-semitone jump",
);

const outOfKey: StructuredTab = {
  ...clean,
  key: "C major",
  sections: [
    {
      id: "main",
      name: "main",
      bars: [
        { bar: 1, beat: 1, sub: 0, dur: "1/4", string: "E", fret: 1 }, // F
        { bar: 1, beat: 2, sub: 0, dur: "1/4", string: "E", fret: 2 }, // F# — out of key
        { bar: 1, beat: 3, sub: 0, dur: "1/4", string: "A", fret: 1 }, // A# — out
        { bar: 1, beat: 4, sub: 0, dur: "1/4", string: "A", fret: 4 }, // C# — out
      ],
    },
  ],
};
const keyReport = auditTab(outOfKey);
assert(
  keyReport.errors.some((e) => e.rule === "key"),
  "key error fires when >25% of notes are out of key",
);

const highFretBeginner: StructuredTab = {
  ...clean,
  difficulty: 1,
  sections: [
    {
      id: "main",
      name: "main",
      bars: [
        { bar: 1, beat: 1, sub: 0, dur: "1/4", string: "G", fret: 20 },
      ],
    },
  ],
};
const highReport = auditTab(highFretBeginner);
assert(
  highReport.warnings.some((w) => w.rule === "range"),
  "range warning fires on fret 20 at difficulty 1",
);

const noProvenance: StructuredTab = { ...clean, provenance: undefined };
const provReport = auditTab(noProvenance);
assert(
  provReport.warnings.some((w) => w.rule === "provenance"),
  "provenance warning fires when missing",
);

console.log("\nAll audit tests passed");
