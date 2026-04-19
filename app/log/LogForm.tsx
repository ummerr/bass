"use client";

import { useEffect, useMemo, useState } from "react";

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildTemplate(date: string, currentLesson: string | null): string {
  const lessonLine = currentLesson ? `[${currentLesson}]` : "[]";
  return `---
date: ${date}
minutes: 15
categories: [technique]
lessons: ${lessonLine}
tabs: []
---

One line on what felt good, one line on what was rough.
`;
}

export function LogForm({ currentLesson }: { currentLesson: string | null }) {
  const [date, setDate] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const d = todayISO();
    setDate(d);
    setText(buildTemplate(d, currentLesson));
  }, [currentLesson]);

  const filename = useMemo(
    () => (date ? `content/practice/${date}.md` : ""),
    [date],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-stone-200 bg-amber-50/60 p-4 text-sm text-stone-700">
        <p className="font-medium text-stone-900">How this works</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-stone-600">
          <li>Copy the template below.</li>
          <li>
            Paste it into a new file named{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] text-stone-800">
              {filename || "content/practice/YYYY-MM-DD.md"}
            </code>
            .
          </li>
          <li>Edit the minutes, categories, and note.</li>
          <li>Commit. The heatmap on the home page ticks green.</li>
        </ol>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-widest text-stone-500">
          Template
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          spellCheck={false}
          className="w-full rounded-lg border border-stone-300 bg-white p-3 font-mono text-[13px] leading-relaxed text-stone-900 focus:border-stone-900 focus:outline-none"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={copy}
          disabled={!text}
          className="inline-flex items-center justify-center rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800 disabled:opacity-40"
        >
          {copied ? "Copied" : "Copy template"}
        </button>
        <span className="text-xs text-stone-500">
          Then paste into{" "}
          <code className="font-mono text-[12px]">{filename}</code>
        </span>
      </div>
    </div>
  );
}
