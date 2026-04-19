import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTabs, getTab, getTabSlugs } from "@/lib/tabs";
import { safeKeyCssVars } from "@/lib/music/keys";
import { TabViewer } from "./TabViewer";

export function generateStaticParams() {
  return getTabSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tab = getTab(slug);
  if (!tab) return {};
  return {
    title: tab.title,
    description: `${tab.title}${
      tab.artist ? ` — ${tab.artist}` : ""
    }. Silent loop practice.`,
  };
}

export default async function TabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tab = getTab(slug);
  if (!tab) notFound();

  const all = getAllTabs();
  const idx = all.findIndex((t) => t.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const keyStyle = safeKeyCssVars(tab.key) as CSSProperties | undefined;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10 sm:py-14" style={keyStyle}>
      <Link
        href="/tabs"
        className="text-sm text-stone-500 hover:text-stone-900"
      >
        ← Back to tabs
      </Link>

      <header className="mt-6 mb-8 rounded-xl border border-l-4 border-stone-200 border-l-[var(--key-accent)] bg-[var(--key-tint)] px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-stone-500">
            Tab
          </span>
          <span
            className="text-xs tracking-widest text-amber-800"
            aria-label={`difficulty ${tab.difficulty} of 5`}
          >
            {"●".repeat(tab.difficulty) + "○".repeat(5 - tab.difficulty)}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{tab.title}</h1>
        {tab.artist && <p className="mt-1 text-stone-600">{tab.artist}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-stone-500">
          {tab.key && (
            <span
              className="rounded-full bg-white/60 px-2 py-0.5 text-[11px] font-medium"
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
          <div className="mt-3 flex flex-wrap gap-1.5">
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
      </header>

      <TabViewer tab={tab} />

      <nav className="mt-12 flex justify-between gap-4 border-t border-stone-200 pt-6 text-sm">
        {prev ? (
          <Link
            href={`/tabs/${prev.slug}`}
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
            href={`/tabs/${next.slug}`}
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
