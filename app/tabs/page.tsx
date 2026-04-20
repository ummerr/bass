import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import {
  getAllTabs,
  CATEGORIES,
  CATEGORY_LABELS,
  type TabMeta,
  type TabCategory,
} from "@/lib/tabs";
import { safeKeyCssVars } from "@/lib/music/keys";
import { TabFilters } from "./TabFilters";

export const metadata: Metadata = {
  title: "Tab library",
  description:
    "Songs broken into small loops. Pick one, set a timer, play the loop until it feels easy.",
};

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function applyFilters(
  tabs: TabMeta[],
  filters: { d: string[]; c: string[]; t: string[]; k: string; q: string },
): TabMeta[] {
  const q = normalize(filters.q);
  return tabs.filter((tab) => {
    if (filters.d.length > 0 && !filters.d.includes(String(tab.difficulty))) {
      return false;
    }
    if (
      filters.c.length > 0 &&
      (!tab.category || !filters.c.includes(tab.category))
    ) {
      return false;
    }
    if (
      filters.t.length > 0 &&
      !filters.t.some((t) => tab.techniques.includes(t))
    ) {
      return false;
    }
    if (filters.k && tab.key !== filters.k) return false;
    if (q) {
      const hay = `${tab.title} ${tab.artist}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function groupByCategory(
  tabs: TabMeta[],
): Array<{ category: TabCategory | "uncategorized"; tabs: TabMeta[] }> {
  const groups = new Map<TabCategory | "uncategorized", TabMeta[]>();
  for (const tab of tabs) {
    const key = tab.category ?? "uncategorized";
    const list = groups.get(key) ?? [];
    list.push(tab);
    groups.set(key, list);
  }
  const order: Array<TabCategory | "uncategorized"> = [
    ...CATEGORIES,
    "uncategorized",
  ];
  return order
    .filter((k) => groups.has(k))
    .map((k) => ({ category: k, tabs: groups.get(k)! }));
}

export default async function TabsPage({
  searchParams,
}: {
  searchParams: Promise<{
    d?: string;
    c?: string;
    t?: string;
    k?: string;
    q?: string;
  }>;
}) {
  const sp = await searchParams;
  const all = getAllTabs();
  const filters = {
    d: parseCsv(sp.d),
    c: parseCsv(sp.c),
    t: parseCsv(sp.t),
    k: sp.k ?? "",
    q: sp.q ?? "",
  };
  const filtered = applyFilters(all, filters);
  const hasAnyFilter =
    filters.d.length > 0 ||
    filters.c.length > 0 ||
    filters.t.length > 0 ||
    filters.k !== "" ||
    filters.q !== "";

  const techniques = Array.from(
    new Set(all.flatMap((t) => t.techniques)),
  ).sort();
  const keys = Array.from(
    new Set(all.map((t) => t.key).filter(Boolean)),
  ).sort();
  const availableCategories = Array.from(
    new Set(all.map((t) => t.category).filter(Boolean) as TabCategory[]),
  );

  const startHere = all.filter((t) => t.startHere);
  const groups = groupByCategory(filtered);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
      <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← Home
      </Link>

      <header className="mt-6 mb-8">
        <p className="text-xs uppercase tracking-widest text-stone-500">
          Play
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Tab library
        </h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Songs broken into small loops. Pick one, set a timer, play the loop
          until it feels easy. Slow and silent is the point — the timer just
          paces you.
        </p>
      </header>

      {!hasAnyFilter && startHere.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-stone-500">
            Start here
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Three recognizable riffs you&apos;ll be able to play this week.
          </p>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {startHere.map((tab) => {
              const keyStyle = safeKeyCssVars(tab.key) as
                | CSSProperties
                | undefined;
              return (
                <li key={tab.slug}>
                  <Link
                    href={`/tabs/${tab.slug}`}
                    style={keyStyle}
                    className="group block h-full rounded-xl border border-stone-200 border-l-4 border-l-[var(--key-accent)] bg-white p-4 transition hover:border-stone-400 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full bg-[var(--key-tint)] px-2 py-0.5 text-[10px] font-semibold"
                        style={{ color: "var(--key-accent)" }}
                      >
                        d{tab.difficulty}
                      </span>
                      {tab.category && (
                        <span className="text-[10px] uppercase tracking-wider text-stone-500">
                          {CATEGORY_LABELS[tab.category]}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-stone-900">
                      {tab.title}
                    </div>
                    {tab.artist && (
                      <div className="text-xs text-stone-500">
                        {tab.artist}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <TabFilters
        availableTechniques={techniques}
        availableKeys={keys}
        availableCategories={availableCategories}
      />

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-stone-500">
          No tabs match those filters. Try clearing them.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          {groups.map(({ category, tabs }) => (
            <section key={category}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-700">
                  {category === "uncategorized"
                    ? "Other"
                    : CATEGORY_LABELS[category]}
                </h2>
                <span className="text-xs text-stone-400">
                  {tabs.length} {tabs.length === 1 ? "tab" : "tabs"}
                </span>
              </div>
              <ol className="flex flex-col gap-3">
                {tabs.map((tab) => (
                  <TabCard key={tab.slug} tab={tab} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function TabCard({ tab }: { tab: TabMeta }) {
  const keyStyle = safeKeyCssVars(tab.key) as CSSProperties | undefined;
  return (
    <li>
      <Link
        href={`/tabs/${tab.slug}`}
        style={keyStyle}
        className="group flex gap-4 rounded-xl border border-stone-200 border-l-4 border-l-[var(--key-accent)] bg-white p-5 transition hover:border-stone-400 hover:border-l-[var(--key-accent)] hover:shadow-sm"
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800">
          {tab.difficulty}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h3 className="text-base font-semibold text-stone-900">
              {tab.title}
            </h3>
            {tab.artist && (
              <span className="text-sm text-stone-500">{tab.artist}</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-stone-500">
            {tab.key && (
              <span
                className="rounded-full bg-[var(--key-tint)] px-2 py-0.5 text-[11px] font-medium"
                style={{ color: "var(--key-accent)" }}
              >
                {tab.key}
              </span>
            )}
            {tab.tempo > 0 && (
              <>
                <span aria-hidden>·</span>
                <span>{tab.tempo} bpm</span>
              </>
            )}
          </div>
          {tab.techniques.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tab.techniques.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="self-center text-stone-400 group-hover:text-stone-900">
          →
        </span>
      </Link>
    </li>
  );
}
