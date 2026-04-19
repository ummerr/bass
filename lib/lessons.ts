import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type LessonStatus =
  | "not-started"
  | "learning"
  | "practicing"
  | "comfortable"
  | "retired";

export const STATUS_ORDER: LessonStatus[] = [
  "not-started",
  "learning",
  "practicing",
  "comfortable",
  "retired",
];

export const STATUS_LABELS: Record<LessonStatus, string> = {
  "not-started": "Not started",
  learning: "Learning",
  practicing: "Practicing",
  comfortable: "Comfortable",
  retired: "Retired",
};

export type LessonMeta = {
  slug: string;
  title: string;
  order: number;
  status: LessonStatus;
  summary: string;
  techniques: string[];
  key?: string;
};

export type Lesson = LessonMeta & { contentHtml: string };

const LESSONS_DIR = path.join(process.cwd(), "content", "lessons");

function slugFromFilename(filename: string): string {
  return filename
    .replace(/\.md$/, "")
    .replace(/^\d+-/, "");
}

function parseLessonMeta(filename: string): LessonMeta {
  const filePath = path.join(LESSONS_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  return {
    slug: slugFromFilename(filename),
    title: String(data.title ?? slugFromFilename(filename)),
    order: Number(data.order ?? 999),
    status: (data.status ?? "not-started") as LessonStatus,
    summary: String(data.summary ?? ""),
    techniques: Array.isArray(data.techniques) ? data.techniques : [],
    key: typeof data.key === "string" ? data.key : undefined,
  };
}

export function getAllLessons(): LessonMeta[] {
  const files = fs
    .readdirSync(LESSONS_DIR)
    .filter((f) => f.endsWith(".md"));
  return files
    .map(parseLessonMeta)
    .sort((a, b) => a.order - b.order);
}

export function getLessonSlugs(): string[] {
  return getAllLessons().map((l) => l.slug);
}

export function getLesson(slug: string): Lesson | null {
  const files = fs
    .readdirSync(LESSONS_DIR)
    .filter((f) => f.endsWith(".md"));
  const match = files.find((f) => slugFromFilename(f) === slug);
  if (!match) return null;
  const raw = fs.readFileSync(path.join(LESSONS_DIR, match), "utf8");
  const { data, content } = matter(raw);
  const contentHtml = marked.parse(content, { async: false }) as string;
  return {
    slug,
    title: String(data.title ?? slug),
    order: Number(data.order ?? 999),
    status: (data.status ?? "not-started") as LessonStatus,
    summary: String(data.summary ?? ""),
    techniques: Array.isArray(data.techniques) ? data.techniques : [],
    key: typeof data.key === "string" ? data.key : undefined,
    contentHtml,
  };
}
