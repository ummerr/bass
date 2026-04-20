#!/usr/bin/env tsx
/**
 * Multi-agent ingest for a single song.
 *
 *   pnpm tsx scripts/ingest-tab.ts "Billie Jean" "Michael Jackson"
 *
 * Spawns 3 parallel research agents + an arbiter, writes a vetted tab to
 * content/tabs/_incoming/{slug}.md. You review in the dev server, then rename
 * to content/tabs/NN-slug.md.
 *
 * Requires ANTHROPIC_API_KEY in the environment.
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import yaml from "js-yaml";
import { StructuredTabSchema, type StructuredTab } from "../lib/tabs/schema";
import { auditTab, formatAuditReport } from "../lib/tabs/audit";

const MODEL = "claude-opus-4-5-20250929";
const MAX_TOKENS = 8192;
const OUT_DIR = path.join(process.cwd(), "content", "tabs", "_incoming");

const RESEARCH_PROMPT = (song: string, artist: string): string => `
You are transcribing the **main bass loop** of "${song}" by ${artist} into a structured YAML format so it can render on a beginner's bass learning site.

## Hard constraints
- Tuning is **EADG** (standard 4-string, standard pitch). If the song uses drop-D or 5-string, stop and output only: { "unsupported": "reason" }.
- Time signature must be **4/4**. If the song is not 4/4, stop and output only: { "unsupported": "not 4/4" }.
- Difficulty is 1 (easiest) to 5 (hardest). Prefer lower if debatable. Rubric:
  - 1 = roots only, mostly quarter notes
  - 2 = roots + fifths or octaves, simple rhythm
  - 3 = syncopation, walking, ghost notes
  - 4 = fast passages, string-crossing, fills
  - 5 = virtuosic

## Accuracy rules
- Cross-check **at least 2 independent sources** (Songsterr, Ultimate Guitar top-rated, reputable YouTube tutorials from named bass teachers, basstabarchive, transcription books). Cite every URL with the date you retrieved it.
- Bass notes must lie on the 4-string fretboard: string ∈ {E, A, D, G}, fret ∈ 0–22.
- Every note in the key's diatonic scale unless the song genuinely uses a chromatic passing tone.
- Tempo ±5 BPM of the canonical recording.

## Output format
Return **only** the YAML frontmatter — no prose, no commentary, no code fences. Start with \`---\` and end with \`---\`. Example:

---
title: Example Song
artist: Example Artist
tuning: EADG
key: E minor
tempo: 124
difficulty: 1
techniques: [fingerstyle, root-octave]
sections:
  - id: main-riff
    name: Main riff
    bars:
      - { bar: 1, beat: 1, dur: "1/4", string: E, fret: 0 }
      - { bar: 1, beat: 2, dur: "1/4", string: E, fret: 0 }
      - { bar: 1, beat: 3, dur: "1/4", string: E, fret: 3 }
      - { bar: 1, beat: 4, dur: "1/4", rest: true }
loops:
  - { sectionId: main-riff, name: "Main riff" }
provenance:
  sources:
    - { url: "https://www.songsterr.com/a/wsa/example-tabs-sYOUR-ID", retrieved: "2026-04-20" }
    - { url: "https://www.youtube.com/watch?v=EXAMPLE", retrieved: "2026-04-20" }
  agents: []
  consensus: pending
  disagreements: []
---

Now transcribe "${song}" by ${artist}. Stick to the main riff — 2–8 bars — not the whole song. If there's a verse bassline that's different from the chorus, include both as separate sections with ids like "verse" and "chorus".
`.trim();

const ARBITER_PROMPT = (song: string, artist: string, candidates: string[]): string => `
You are the arbiter deciding the final bass transcription for "${song}" by ${artist}.

You were given 3 independent transcriptions from 3 agents. Your job:

1. Read all 3 candidates. For each bar/beat, identify where they agree and disagree.
2. If **all three agree bar-for-bar on notes, string, fret, duration, and rests** → consensus is "unanimous".
3. If they disagree on ≤ 2 notes in the main riff → pick the majority for each disputed note, log the disagreement in \`provenance.disagreements\`, consensus is "resolved".
4. If they disagree on > 2 notes, or on the key, or on the time signature → consensus is "disputed". Still produce your best guess but flag it.
5. Merge all cited sources (deduplicated) into \`provenance.sources\`.
6. Set \`provenance.agents: ["research-1", "research-2", "research-3", "arbiter"]\`.
7. Set \`provenance.ummerr_verified\` to an empty string (Ummerr verifies by ear later).

Output **only** the final YAML frontmatter, starting with \`---\` and ending with \`---\`. No commentary.

## Candidates

### Candidate 1
${candidates[0]}

### Candidate 2
${candidates[1]}

### Candidate 3
${candidates[2]}
`.trim();

function extractFrontmatter(text: string): string | null {
  const m = text.match(/---\s*\n([\s\S]*?)\n---/);
  return m ? m[1] : null;
}

async function callClaude(
  client: Anthropic,
  prompt: string,
  useWebSearch: boolean,
): Promise<string> {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature: useWebSearch ? 0.7 : 0.2,
    tools: useWebSearch
      ? [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }]
      : undefined,
    messages: [{ role: "user", content: prompt }],
  });
  const parts = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text);
  return parts.join("\n").trim();
}

async function researchOnce(
  client: Anthropic,
  song: string,
  artist: string,
  label: string,
): Promise<string | null> {
  process.stderr.write(`  → ${label} researching...\n`);
  try {
    const text = await callClaude(client, RESEARCH_PROMPT(song, artist), true);
    const fm = extractFrontmatter(text);
    if (!fm) {
      process.stderr.write(`  ✗ ${label} returned no YAML\n`);
      return null;
    }
    process.stderr.write(`  ✓ ${label} done (${fm.length} chars)\n`);
    return fm;
  } catch (err) {
    process.stderr.write(`  ✗ ${label} failed: ${(err as Error).message}\n`);
    return null;
  }
}

function parseAndAudit(yamlBody: string): {
  tab: StructuredTab | null;
  errors: string[];
} {
  let parsed: unknown;
  try {
    parsed = yaml.load(yamlBody);
  } catch (err) {
    return { tab: null, errors: [`YAML parse: ${(err as Error).message}`] };
  }
  const result = StructuredTabSchema.safeParse(parsed);
  if (!result.success) {
    return {
      tab: null,
      errors: result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      ),
    };
  }
  const report = auditTab(result.data);
  if (!report.ok) {
    return {
      tab: result.data,
      errors: report.errors.map((e) => `${e.rule}: ${e.message}`),
    };
  }
  return { tab: result.data, errors: [] };
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main(): Promise<void> {
  const [song, artist] = process.argv.slice(2);
  if (!song || !artist) {
    console.error("Usage: pnpm tsx scripts/ingest-tab.ts <song> <artist>");
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY env var required");
    process.exit(1);
  }
  const client = new Anthropic();

  fs.mkdirSync(OUT_DIR, { recursive: true });

  process.stderr.write(`Ingesting "${song}" by ${artist}\n`);
  const candidates = await Promise.all([
    researchOnce(client, song, artist, "agent-1"),
    researchOnce(client, song, artist, "agent-2"),
    researchOnce(client, song, artist, "agent-3"),
  ]);
  const valid = candidates.filter((c): c is string => c !== null);
  if (valid.length < 2) {
    process.stderr.write(
      `✗ Only ${valid.length} candidate(s) succeeded — aborting\n`,
    );
    process.exit(1);
  }

  process.stderr.write(`\nArbitrating ${valid.length} candidate(s)...\n`);
  // Pad to 3 so the template always has 3 slots.
  while (valid.length < 3) valid.push("(no candidate)");
  const arbiterText = await callClaude(
    client,
    ARBITER_PROMPT(song, artist, valid),
    false,
  );
  const finalYaml = extractFrontmatter(arbiterText);
  if (!finalYaml) {
    process.stderr.write(`✗ Arbiter returned no YAML\n`);
    process.exit(1);
  }

  const { tab, errors } = parseAndAudit(finalYaml);
  if (!tab) {
    process.stderr.write(`✗ Final YAML failed validation:\n`);
    for (const e of errors) process.stderr.write(`   ${e}\n`);
    process.stderr.write(`\n---\n${finalYaml}\n---\n`);
    process.exit(1);
  }

  const report = auditTab(tab);
  process.stderr.write(`\n${formatAuditReport(tab.title, report)}\n`);

  const slug = slugify(tab.title);
  const outPath = path.join(OUT_DIR, `${slug}.md`);
  const body = tab.sections.length > 0
    ? `Main riff is ${tab.sections[0].bars.length} notes. Loop it silently until your fingers know where to go without looking.\n`
    : "";
  fs.writeFileSync(outPath, `---\n${finalYaml}\n---\n\n${body}`);
  process.stderr.write(`\n✓ Wrote ${outPath}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
