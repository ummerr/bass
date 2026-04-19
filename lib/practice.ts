import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PracticeCategory =
  | "technique"
  | "fretboard"
  | "rhythm"
  | "theory"
  | "song";

export const CATEGORY_LABELS: Record<PracticeCategory, string> = {
  technique: "Technique",
  fretboard: "Fretboard",
  rhythm: "Rhythm",
  theory: "Theory",
  song: "Song",
};

export type PracticeEntry = {
  date: string;
  minutes: number;
  categories: PracticeCategory[];
  lessons: string[];
  tabs: string[];
  note: string;
};

export type HeatmapDay = {
  date: string;
  minutes: number;
  note: string;
  inRange: boolean;
  isToday: boolean;
  isFuture: boolean;
};

const PRACTICE_DIR = path.join(process.cwd(), "content", "practice");
const FILENAME_RE = /^(\d{4}-\d{2}-\d{2})\.md$/;
const VALID_CATEGORIES = new Set<PracticeCategory>([
  "technique",
  "fretboard",
  "rhythm",
  "theory",
  "song",
]);

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseEntry(filename: string): PracticeEntry | null {
  const match = filename.match(FILENAME_RE);
  if (!match) return null;
  const date = match[1];
  const raw = fs.readFileSync(path.join(PRACTICE_DIR, filename), "utf8");
  const { data, content } = matter(raw);
  const categories = Array.isArray(data.categories)
    ? data.categories.filter((c): c is PracticeCategory =>
        VALID_CATEGORIES.has(c as PracticeCategory),
      )
    : [];
  return {
    date,
    minutes: Number(data.minutes ?? 0),
    categories,
    lessons: Array.isArray(data.lessons) ? data.lessons.map(String) : [],
    tabs: Array.isArray(data.tabs) ? data.tabs.map(String) : [],
    note: content.trim(),
  };
}

export function getAllEntries(): PracticeEntry[] {
  if (!fs.existsSync(PRACTICE_DIR)) return [];
  const files = fs.readdirSync(PRACTICE_DIR).filter((f) => FILENAME_RE.test(f));
  const entries = files
    .map(parseEntry)
    .filter((e): e is PracticeEntry => e !== null);
  entries.sort((a, b) => b.date.localeCompare(a.date));
  return entries;
}

export function computeStreak(entries: PracticeEntry[]): number {
  const dates = new Set(entries.map((e) => e.date));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!dates.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (dates.has(toISODate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getHeatmapDays(
  entries: PracticeEntry[],
  days = 90,
): HeatmapDay[] {
  const byDate = new Map(entries.map((e) => [e.date, e]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toISODate(today);

  const rangeStart = new Date(today);
  rangeStart.setDate(today.getDate() - days + 1);
  const rangeStartStr = toISODate(rangeStart);

  const gridStart = new Date(rangeStart);
  gridStart.setDate(rangeStart.getDate() - rangeStart.getDay());

  const gridEnd = new Date(today);
  gridEnd.setDate(today.getDate() + (6 - today.getDay()));

  const result: HeatmapDay[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const iso = toISODate(cursor);
    const entry = byDate.get(iso);
    result.push({
      date: iso,
      minutes: entry?.minutes ?? 0,
      note: entry?.note ?? "",
      inRange: iso >= rangeStartStr && iso <= todayStr,
      isToday: iso === todayStr,
      isFuture: iso > todayStr,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function hasEntryToday(entries: PracticeEntry[]): boolean {
  return entries.some((e) => e.date === todayISO());
}
