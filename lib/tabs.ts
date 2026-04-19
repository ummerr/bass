import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type TabLoop = {
  name: string;
  startLine: number;
  endLine: number;
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
};

export type Tab = TabMeta & {
  body: string;
  lines: string[];
};

const TABS_DIR = path.join(process.cwd(), "content", "tabs");

function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, "").replace(/^\d+-/, "");
}

function orderFromFilename(filename: string): number {
  const match = /^(\d+)-/.exec(filename);
  return match ? Number(match[1]) : 999;
}

function parseLoops(raw: unknown): TabLoop[] {
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

function parseTabMeta(filename: string): TabMeta {
  const filePath = path.join(TABS_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  return {
    slug: slugFromFilename(filename),
    order: orderFromFilename(filename),
    title: String(data.title ?? slugFromFilename(filename)),
    artist: String(data.artist ?? ""),
    key: String(data.key ?? ""),
    tempo: Number(data.tempo ?? 0),
    difficulty: Number(data.difficulty ?? 1),
    techniques: Array.isArray(data.techniques) ? data.techniques : [],
    loops: parseLoops(data.loops),
  };
}

function listTabFiles(): string[] {
  return fs.readdirSync(TABS_DIR).filter((f) => f.endsWith(".md"));
}

export function getAllTabs(): TabMeta[] {
  return listTabFiles()
    .map(parseTabMeta)
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
  const raw = fs.readFileSync(path.join(TABS_DIR, match), "utf8");
  const { data, content } = matter(raw);
  const body = content.replace(/^\n+/, "").replace(/\n+$/, "");
  return {
    slug,
    order: orderFromFilename(match),
    title: String(data.title ?? slug),
    artist: String(data.artist ?? ""),
    key: String(data.key ?? ""),
    tempo: Number(data.tempo ?? 0),
    difficulty: Number(data.difficulty ?? 1),
    techniques: Array.isArray(data.techniques) ? data.techniques : [],
    loops: parseLoops(data.loops),
    body,
    lines: body.split("\n"),
  };
}
