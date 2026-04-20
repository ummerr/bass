import type { BassString, StructuredTab, TabNote } from "./schema";
import { noteAt, noteIndex, type Note } from "../music/notes";
import { parseKey, type Key } from "../music/keys";
import { SCALES } from "../music/scales";

export type AuditLevel = "error" | "warn";

export type AuditIssue = {
  level: AuditLevel;
  rule: string;
  message: string;
  path?: string;
};

export type AuditReport = {
  ok: boolean;
  errors: AuditIssue[];
  warnings: AuditIssue[];
  stats: {
    totalNotes: number;
    outOfKey: number;
    highestFret: number;
  };
};

const OPEN_STRING_INDEX: Record<BassString, number> = {
  E: noteIndex("E"),
  A: noteIndex("A"),
  D: noteIndex("D"),
  G: noteIndex("G"),
};

const OPEN_STRING_MIDI: Record<BassString, number> = {
  E: 28,
  A: 33,
  D: 38,
  G: 43,
};

function notePitchClass(n: TabNote): number | null {
  if (n.rest || n.string === undefined || n.fret === undefined) return null;
  return (OPEN_STRING_INDEX[n.string] + n.fret) % 12;
}

function noteMidi(n: TabNote): number | null {
  if (n.rest || n.string === undefined || n.fret === undefined) return null;
  return OPEN_STRING_MIDI[n.string] + n.fret;
}

function keyScalePitchClasses(key: Key): Set<number> {
  const intervals = key.mode === "major" ? SCALES.major : SCALES["natural-minor"];
  const rootPc = noteIndex(key.root);
  return new Set(intervals.map((i) => (rootPc + i) % 12));
}

function pcName(pc: number): Note {
  return noteAt(pc);
}

function collectNotes(tab: StructuredTab): {
  note: TabNote;
  path: string;
  sectionId: string;
  bar: number;
  beat: number;
}[] {
  const out: {
    note: TabNote;
    path: string;
    sectionId: string;
    bar: number;
    beat: number;
  }[] = [];
  tab.sections.forEach((section, si) => {
    section.bars.forEach((note, ni) => {
      out.push({
        note,
        path: `sections[${si}].bars[${ni}]`,
        sectionId: section.id,
        bar: note.bar,
        beat: note.beat,
      });
    });
  });
  return out;
}

export function auditTab(tab: StructuredTab): AuditReport {
  const errors: AuditIssue[] = [];
  const warnings: AuditIssue[] = [];
  const notes = collectNotes(tab);

  // Rule 2: tuning. Schema constrains to "EADG" literal, so this is belt-and-braces.
  if (tab.tuning !== "EADG") {
    errors.push({
      level: "error",
      rule: "tuning",
      message: `Tuning must be EADG, got "${tab.tuning}"`,
    });
  }

  // Rule 5: range sanity.
  let highestFret = 0;
  const maxFretForDifficulty = tab.difficulty <= 2 ? 17 : 22;
  for (const { note, path } of notes) {
    if (note.fret === undefined) continue;
    if (note.fret > highestFret) highestFret = note.fret;
    if (note.fret > maxFretForDifficulty) {
      warnings.push({
        level: "warn",
        rule: "range",
        path,
        message: `Fret ${note.fret} exceeds beginner cap ${maxFretForDifficulty} (difficulty ${tab.difficulty})`,
      });
    }
    if (note.fret > 22) {
      errors.push({
        level: "error",
        rule: "range",
        path,
        message: `Fret ${note.fret} outside 4-string boundary (max 22)`,
      });
    }
  }

  // Rule 6: leap sanity — same-string jumps > 1 octave without a rest between.
  for (let i = 1; i < notes.length; i++) {
    const prev = notes[i - 1].note;
    const curr = notes[i].note;
    if (prev.rest || curr.rest) continue;
    if (prev.string !== curr.string) continue;
    if (prev.fret === undefined || curr.fret === undefined) continue;
    const leap = Math.abs(prev.fret - curr.fret);
    if (leap > 12) {
      warnings.push({
        level: "warn",
        rule: "leap",
        path: notes[i].path,
        message: `${leap}-semitone jump on ${curr.string}-string (likely transcription slip)`,
      });
    }
  }

  // Rule 4: key sanity.
  const key = parseKey(tab.key);
  let outOfKey = 0;
  if (key) {
    const inKey = keyScalePitchClasses(key);
    for (const { note, path } of notes) {
      const pc = notePitchClass(note);
      if (pc === null) continue;
      if (!inKey.has(pc)) {
        outOfKey++;
        warnings.push({
          level: "warn",
          rule: "key",
          path,
          message: `Note ${pcName(pc)} is not diatonic to ${tab.key}`,
        });
      }
    }
    const playedNotes = notes.filter((n) => !n.note.rest).length;
    if (playedNotes > 0 && outOfKey / playedNotes > 0.25) {
      errors.push({
        level: "error",
        rule: "key",
        message: `${outOfKey}/${playedNotes} notes are out of ${tab.key} (>25% — key may be wrong)`,
      });
    }
  } else if (tab.key.length > 0) {
    warnings.push({
      level: "warn",
      rule: "key",
      message: `Key "${tab.key}" could not be parsed`,
    });
  } else {
    warnings.push({
      level: "warn",
      rule: "key",
      message: "No key declared",
    });
  }

  // Rule 7: tempo sanity.
  if (tab.tempo === 0) {
    warnings.push({ level: "warn", rule: "tempo", message: "Tempo not set" });
  } else if (tab.tempo < 40 || tab.tempo > 250) {
    warnings.push({
      level: "warn",
      rule: "tempo",
      message: `Tempo ${tab.tempo} BPM outside typical range 40–250`,
    });
  }

  // Rule 8: provenance minimum.
  const prov = tab.provenance;
  if (!prov) {
    warnings.push({
      level: "warn",
      rule: "provenance",
      message: "No provenance block",
    });
  } else {
    if (prov.sources.length < 2) {
      warnings.push({
        level: "warn",
        rule: "provenance.sources",
        message: `Only ${prov.sources.length} source(s); rubric requires ≥ 2`,
      });
    }
    if (prov.agents.length < 2) {
      warnings.push({
        level: "warn",
        rule: "provenance.agents",
        message: `Only ${prov.agents.length} agent(s); rubric requires ≥ 2`,
      });
    }
    if (prov.consensus === "disputed") {
      errors.push({
        level: "error",
        rule: "provenance.consensus",
        message: "Consensus is disputed — tab should stay in _incoming/",
      });
    }
    if (prov.consensus === "pending") {
      warnings.push({
        level: "warn",
        rule: "provenance.consensus",
        message: "Consensus pending — not yet verified",
      });
    }
  }

  // Rule 9: playability — schema covers fret 0–24 and string enum; leave cross-checks.
  for (const { note, path } of notes) {
    if (note.rest) continue;
    if (note.fret !== undefined && note.fret < 0) {
      errors.push({
        level: "error",
        rule: "playability",
        path,
        message: `Negative fret ${note.fret}`,
      });
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalNotes: notes.length,
      outOfKey,
      highestFret,
    },
  };
}

export function formatAuditReport(tabTitle: string, report: AuditReport): string {
  const lines: string[] = [];
  const header = report.ok ? "OK" : "FAIL";
  lines.push(`[${header}] ${tabTitle}`);
  lines.push(
    `  ${report.stats.totalNotes} notes · highest fret ${report.stats.highestFret} · ${report.stats.outOfKey} out-of-key`,
  );
  for (const e of report.errors) {
    lines.push(`  ✗ ${e.rule}${e.path ? ` (${e.path})` : ""}: ${e.message}`);
  }
  for (const w of report.warnings) {
    lines.push(`  ! ${w.rule}${w.path ? ` (${w.path})` : ""}: ${w.message}`);
  }
  return lines.join("\n");
}
