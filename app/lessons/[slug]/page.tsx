import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllLessons, getLesson, getLessonSlugs } from "@/lib/lessons";
import { StatusBadge } from "../StatusBadge";

export function generateStaticParams() {
  return getLessonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return {};
  return {
    title: lesson.title,
    description: lesson.summary,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const all = getAllLessons();
  const idx = all.findIndex((l) => l.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10 sm:py-14">
      <Link
        href="/lessons"
        className="text-sm text-stone-500 hover:text-stone-900"
      >
        ← Back to path
      </Link>

      <header className="mt-6 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-stone-500">
            Step {lesson.order}
          </span>
          <StatusBadge status={lesson.status} />
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {lesson.title}
        </h1>
        <p className="mt-2 text-stone-600">{lesson.summary}</p>
        {lesson.techniques.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {lesson.techniques.map((t) => (
              <span
                key={t}
                className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      <article
        className="prose-lesson"
        dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
      />

      <nav className="mt-12 flex justify-between gap-4 border-t border-stone-200 pt-6 text-sm">
        {prev ? (
          <Link
            href={`/lessons/${prev.slug}`}
            className="flex flex-col items-start text-stone-600 hover:text-stone-900"
          >
            <span className="text-xs uppercase tracking-wider">
              ← Previous
            </span>
            <span className="font-medium">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/lessons/${next.slug}`}
            className="flex flex-col items-end text-right text-stone-600 hover:text-stone-900"
          >
            <span className="text-xs uppercase tracking-wider">Next →</span>
            <span className="font-medium">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
