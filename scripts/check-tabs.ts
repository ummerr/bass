#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { StructuredTabSchema } from "../lib/tabs/schema";
import { auditTab, formatAuditReport } from "../lib/tabs/audit";

const TABS_DIR = path.join(process.cwd(), "content", "tabs");

type FileResult = {
  filename: string;
  structured: boolean;
  ok: boolean;
  hasErrors: boolean;
  summary: string;
};

function checkFile(filename: string): FileResult {
  const raw = fs.readFileSync(path.join(TABS_DIR, filename), "utf8");
  const { data } = matter(raw);
  const d = (data ?? {}) as Record<string, unknown>;
  const isStructured =
    typeof d.tuning !== "undefined" || Array.isArray(d.sections);

  if (!isStructured) {
    return {
      filename,
      structured: false,
      ok: true,
      hasErrors: false,
      summary: `[SKIP] ${filename} — legacy ASCII, no audit`,
    };
  }

  const parsed = StructuredTabSchema.safeParse(d);
  if (!parsed.success) {
    return {
      filename,
      structured: true,
      ok: false,
      hasErrors: true,
      summary: `[FAIL] ${filename} — schema error:\n${parsed.error.issues
        .map((i) => `  ✗ ${i.path.join(".")}: ${i.message}`)
        .join("\n")}`,
    };
  }
  const report = auditTab(parsed.data);
  return {
    filename,
    structured: true,
    ok: report.ok,
    hasErrors: report.errors.length > 0,
    summary: formatAuditReport(`${filename} — ${parsed.data.title}`, report),
  };
}

function main(): void {
  const files = fs
    .readdirSync(TABS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();
  const results = files.map(checkFile);
  for (const r of results) console.log(r.summary);
  const failures = results.filter((r) => r.hasErrors).length;
  const total = results.length;
  const structured = results.filter((r) => r.structured).length;
  console.log(
    `\n${total} tab(s) · ${structured} structured · ${failures} with errors`,
  );
  process.exit(failures > 0 ? 1 : 0);
}

main();
