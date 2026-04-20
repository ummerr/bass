import Link from "next/link";
import type { CSSProperties } from "react";
import { getAllLessons } from "@/lib/lessons";
import {
  computeStreak,
  getAllEntries,
  getHeatmapDays,
  hasEntryToday,
} from "@/lib/practice";
import { getAllTabs } from "@/lib/tabs";
import { safeKeyCssVars } from "@/lib/music/keys";
import { StatusBadge } from "./lessons/StatusBadge";
import { Heatmap } from "./_components/Heatmap";
import { FretboardMinute } from "./_components/FretboardMinute";

export default function Home() {
  const lessons = getAllLessons();
  const skill =
    lessons.find((l) => l.status === "learning") ??
    lessons.find((l) => l.status === "not-started") ??
    null;

  const entries = getAllEntries();
  const streak = computeStreak(entries);
  const heatmap = getHeatmapDays(entries, 90);
  const loggedToday = hasEntryToday(entries);

  const tabs = getAllTabs();
  const starters = tabs.filter((t) => t.startHere);
  const funTab = starters[0] ?? tabs[0] ?? null;

  const skillKeyStyle = safeKeyCssVars(skill?.key) as CSSProperties | undefined;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10 sm:py-14">
      <section>
        <p className="text-xs uppercase tracking-widest text-stone-500">
          Today
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Pick up your bass.
        </h1>
        <p className="mt-3 text-stone-600">
          Five small things. About fifteen minutes. Skip any of them — showing
          up is the win.
        </p>
      </section>

      <ol className="mt-10 flex flex-col gap-4">
        <Step number={1} duration="1 min" title="Warm up">
          <p className="mt-1 text-sm text-stone-600">
            Sit with the strap on. Alternate index–middle on the A string, open,
            slow. Relax your right thumb.
          </p>
        </Step>

        <Step number={2} duration="5–8 min" title="Skill of the week">
          {skill ? (
            <>
              <p className="mt-1 text-sm text-stone-600">
                {skill.summary}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href={`/lessons/${skill.slug}`}
                  className="inline-flex items-center rounded-md bg-amber-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-800"
                >
                  {skill.order}. {skill.title} →
                </Link>
                <StatusBadge status={skill.status} />
                {skill.key && skillKeyStyle && (
                  <span
                    className="rounded-full bg-[var(--key-tint)] px-2 py-0.5 text-[11px] font-medium"
                    style={{ ...skillKeyStyle, color: "var(--key-accent)" }}
                  >
                    in {skill.key}
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="mt-1 text-sm text-stone-600">
              All ten beginner lessons are done. Pick one to revisit.
            </p>
          )}
        </Step>

        <Step number={3} duration="2 min" title="Fretboard minute">
          <FretboardMinute />
        </Step>

        <Step number={4} duration="5 min" title="Play something fun">
          <p className="mt-1 text-sm text-stone-600">
            New: a guided breakdown of the Fabienk main riff — three warm-ups,
            four chunks, silent loops. Great for a fresh bass.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/learn/fabienk"
              className="inline-flex items-center rounded-md bg-amber-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-800"
            >
              Learn: Fabienk →
            </Link>
            {funTab && (
              <Link
                href={`/tabs/${funTab.slug}`}
                className="text-sm text-stone-500 hover:text-stone-900"
              >
                Or loop: {funTab.title}
              </Link>
            )}
            <Link
              href="/tabs"
              className="text-sm text-stone-500 hover:text-stone-900"
            >
              Browse tabs
            </Link>
          </div>
        </Step>

        <Step number={5} duration="10 sec" title="Log it">
          <p className="mt-1 text-sm text-stone-600">
            {loggedToday
              ? "Already logged today. Nice."
              : "One line about what felt good, one about what was rough. The streak is the only scoreboard."}
          </p>
          <Link
            href="/log"
            className="mt-3 inline-flex items-center rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-900 transition hover:border-stone-900"
          >
            {loggedToday ? "Log another session" : "Log today's practice"} →
          </Link>
        </Step>
      </ol>

      <section className="mt-14 rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-stone-500">
              Progress
            </h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight text-amber-700">
                {streak}
              </span>
              <span className="text-sm text-stone-600">day streak</span>
            </div>
            <p className="mt-1 max-w-xs text-sm text-stone-500">
              Missed days are fine. Comeback beats streak.
            </p>
          </div>
          <div className="flex-1 min-w-[280px]">
            <Heatmap days={heatmap} />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs uppercase tracking-widest text-stone-500">
          Explore
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ExploreCard
            href="/lessons"
            title="Beginner path"
            blurb="All ten lessons, in order."
          />
          <ExploreCard
            href="/fretboard"
            title="Fretboard"
            blurb="See where every note lives."
          />
          <ExploreCard
            href="/tabs"
            title="Tab library"
            blurb="Saved tabs with loopable sections."
          />
          <ExploreCard
            title="Fundamentals"
            blurb="Intervals, rhythm, circle of fifths."
            soon
          />
        </div>
      </section>

      <footer className="mt-14 text-xs text-stone-400">
        Ummerr&apos;s bass site
      </footer>
    </main>
  );
}

const STEP_COLORS = [
  "bg-amber-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-violet-500",
];

function Step({
  number,
  duration,
  title,
  children,
}: {
  number: number;
  duration: string;
  title: string;
  children: React.ReactNode;
}) {
  const color = STEP_COLORS[(number - 1) % STEP_COLORS.length];
  return (
    <li className="flex gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-[0_1px_0_rgba(28,25,23,0.04)]">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${color}`}
      >
        {number}
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-base font-semibold text-stone-900">{title}</h3>
          <span className="text-xs uppercase tracking-wider text-stone-400">
            {duration}
          </span>
        </div>
        {children}
      </div>
    </li>
  );
}

function ExploreCard({
  href,
  title,
  blurb,
  soon,
}: {
  href?: string;
  title: string;
  blurb: string;
  soon?: boolean;
}) {
  const inner = (
    <article className="flex h-full flex-col justify-between rounded-xl border border-stone-200 bg-white p-5 transition hover:border-stone-400 hover:shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">{title}</h3>
          {soon && (
            <span className="rounded-full border border-stone-200 px-2 py-0.5 text-[10px] uppercase tracking-wider text-stone-500">
              soon
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-stone-600">{blurb}</p>
      </div>
    </article>
  );
  return href && !soon ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  );
}
