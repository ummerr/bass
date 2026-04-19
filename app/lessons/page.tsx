import Link from "next/link";
import type { Metadata } from "next";
import { getAllLessons } from "@/lib/lessons";
import { StatusBadge } from "./StatusBadge";

export const metadata: Metadata = {
  title: "Beginner path",
  description: "A linear set of beginner bass lessons, in the order to learn them.",
};

export default function LessonsPage() {
  const lessons = getAllLessons();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          Learn
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Beginner path
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Top to bottom, in order. Do each one until the status moves from
          &quot;Learning&quot; to &quot;Comfortable&quot; before starting the next.
        </p>
      </header>

      <ol className="flex flex-col gap-3">
        {lessons.map((l) => (
          <li key={l.slug}>
            <Link
              href={`/lessons/${l.slug}`}
              className="group flex gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-400 hover:shadow-sm"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                {l.order}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-neutral-900">
                    {l.title}
                  </h2>
                  <StatusBadge status={l.status} />
                </div>
                <p className="mt-1 text-sm text-neutral-600">{l.summary}</p>
              </div>
              <span className="self-center text-neutral-400 group-hover:text-neutral-900">
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
