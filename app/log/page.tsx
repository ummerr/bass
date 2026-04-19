import Link from "next/link";
import type { Metadata } from "next";
import {
  CATEGORY_LABELS,
  getAllEntries,
  type PracticeCategory,
} from "@/lib/practice";
import { getAllLessons } from "@/lib/lessons";
import { LogForm } from "./LogForm";

export const metadata: Metadata = {
  title: "Log practice",
  description: "Log today's practice session as a markdown entry.",
};

export default function LogPage() {
  const entries = getAllEntries();
  const lessons = getAllLessons();
  const currentLesson =
    lessons.find((l) => l.status === "learning")?.slug ??
    lessons.find((l) => l.status === "not-started")?.slug ??
    null;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm text-stone-500 hover:text-stone-900"
      >
        ← Home
      </Link>

      <header className="mt-6 mb-8">
        <p className="text-xs uppercase tracking-widest text-stone-500">
          Practice
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Log today</h1>
        <p className="mt-2 text-stone-600">
          One markdown file per day. Git becomes the streak tracker.
        </p>
      </header>

      <LogForm currentLesson={currentLesson} />

      {entries.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xs uppercase tracking-widest text-stone-500">
            Recent entries
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {entries.slice(0, 10).map((e) => (
              <li
                key={e.date}
                className="rounded-lg border border-stone-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-medium text-stone-900">
                    {e.date}
                  </span>
                  <span className="text-sm text-stone-500">
                    · {e.minutes} min
                  </span>
                  {e.categories.map((c) => (
                    <span
                      key={c}
                      className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600"
                    >
                      {CATEGORY_LABELS[c as PracticeCategory] ?? c}
                    </span>
                  ))}
                </div>
                {e.note && (
                  <p className="mt-2 text-sm text-stone-600">{e.note}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
