import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import {
  CategorySchema,
  StructuredTabSchema,
  type StructuredTab,
  type TabCategory,
  type TabProvenance,
} from "./schema";
import { renderAscii } from "./render-ascii";

export type TabLoop = {
  name: string;
  startLine: number;
  endLine: number;
  sectionId?: string;
};

export type TabMeta = {
  slug: string;
  order: number;
  title: string;
  artist: string;
  key: string;
  tempo: number;
  difficulty: number;
  techniques: string[];
  loops: TabLoop[];
  tuning?: string;
  category?: TabCategory;
  startHere: boolean;
};

export type Tab = TabMeta & {
  body: string;
  lines: string[];
  structured?: StructuredTab;
  provenance?: TabProvenance;
};

const TABS_DIR = path.join(process.cwd(), "content", "tabs");

function slugFromFilename(f: string): string {
  return f.replace(/\.md$/, "").replace(/^\d+-/, "");
}

function orderFromFilename(f: string): number {
  const m = /^(\d+)-/.exec(f);
  return m ? Number(m[1]) : 999;
}

function parseLegacyLoops(raw: unknown): TabLoop[] {
  if (!Array.isArray(raw)) return [];
  const loops: TabLoop[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const name = typeof rec.name === "string" ? rec.name : null;
    const startLine = Number(rec.startLine);
    const endLine = Number(rec.endLine);
    if (!name) continue;
    if (!Number.isFinite(startLine) || !Number.isFinite(endLine)) continue;
    if (startLine < 1 || endLine < startLine) continue;
    loops.push({ name, startLine, endLine });
  }
  return loops;
}

function isStructured(data: Record<string, unknown>): boolean {
  return typeof data.tuning !== "undefined" || Array.isArray(data.sections);
}

function trimBlank(s: string): string {
  return s.replace(/^\n+/, "").replace(/\n+$/, "");
}

type Parsed = { tab: Tab };

function parseStructured(
  filename: string,
  data: Record<string, unknown>,
  rawBody: string,
): Parsed {
  const result = StructuredTabSchema.safeParse(data);
  if (!result.success) {
    const pretty = z.prettifyError(result.error);
    throw new Error(`Invalid tab "${filename}":\n${pretty}`);
  }
  const structured = result.data;

  const prose = trimBlank(rawBody);
  const { lines: asciiLines, sectionRanges } = renderAscii(structured);

  const outLines: string[] = [];
  if (prose.length > 0) {
    for (const l of prose.split("\n")) outLines.push(l);
    outLines.push("");
  }
  const asciiStart = outLines.length;
  for (const l of asciiLines) outLines.push(l);

  const loops: TabLoop[] = structured.loops.map((ref) => {
    const range = sectionRanges.get(ref.sectionId)!;
    return {
      name: ref.name,
      startLine: asciiStart + range.start + 1,
      endLine: asciiStart + range.end + 1,
      sectionId: ref.sectionId,
    };
  });

  const slug = slugFromFilename(filename);
  const meta: TabMeta = {
    slug,
    order: orderFromFilename(filename),
    title: structured.title,
    artist: structured.artist,
    key: structured.key,
    tempo: structured.tempo,
    difficulty: structured.difficulty,
    techniques: structured.techniques,
    loops,
    tuning: structured.tuning,
    category: structured.category,
    startHere: structured.startHere,
  };
  const body = outLines.join("\n");
  return {
    tab: {
      ...meta,
      body,
      lines: outLines,
      structured,
      provenance: structured.provenance,
    },
  };
}

function parseLegacy(
  filename: string,
  data: Record<string, unknown>,
  rawBody: string,
): Parsed {
  const body = trimBlank(rawBody);
  const slug = slugFromFilename(filename);
  const categoryParsed = CategorySchema.safeParse(data.category);
  const meta: TabMeta = {
    slug,
    order: orderFromFilename(filename),
    title: String(data.title ?? slug),
    artist: String(data.artist ?? ""),
    key: String(data.key ?? ""),
    tempo: Number(data.tempo ?? 0),
    difficulty: Number(data.difficulty ?? 1),
    techniques: Array.isArray(data.techniques)
      ? (data.techniques as string[])
      : [],
    loops: parseLegacyLoops(data.loops),
    category: categoryParsed.success ? categoryParsed.data : undefined,
    startHere: data.startHere === true,
  };
  return {
    tab: { ...meta, body, lines: body.split("\n") },
  };
}

function readFile(filename: string): Parsed {
  const filePath = path.join(TABS_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const d = (data ?? {}) as Record<string, unknown>;
  return isStructured(d)
    ? parseStructured(filename, d, content)
    : parseLegacy(filename, d, content);
}

function listTabFiles(): string[] {
  return fs.readdirSync(TABS_DIR).filter((f) => f.endsWith(".md"));
}

export function getAllTabs(): TabMeta[] {
  return listTabFiles()
    .map(readFile)
    .map((p): TabMeta => ({
      slug: p.tab.slug,
      order: p.tab.order,
      title: p.tab.title,
      artist: p.tab.artist,
      key: p.tab.key,
      tempo: p.tab.tempo,
      difficulty: p.tab.difficulty,
      techniques: p.tab.techniques,
      loops: p.tab.loops,
      tuning: p.tab.tuning,
      category: p.tab.category,
      startHere: p.tab.startHere,
    }))
    .sort((a, b) => {
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });
}

export function getTabSlugs(): string[] {
  return getAllTabs().map((t) => t.slug);
}

export function getTab(slug: string): Tab | null {
  const match = listTabFiles().find((f) => slugFromFilename(f) === slug);
  if (!match) return null;
  return readFile(match).tab;
}
