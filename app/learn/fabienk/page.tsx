import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTab } from "@/lib/tabs";
import { safeKeyCssVars } from "@/lib/music/keys";
import { LearnFabienk } from "./LearnFabienk";

export const metadata: Metadata = {
  title: "Learn: Fabienk",
  description:
    "A guided, silent, chunk-by-chunk path to learn the main riff of Fabienk by Angine de Poitrine.",
};

export default function LearnFabienkPage() {
  const tab = getTab("fabienk");
  if (!tab) notFound();
  const keyStyle = safeKeyCssVars(tab.key) as CSSProperties | undefined;

  return (
    <main
      className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14"
      style={keyStyle}
    >
      <Link
        href="/tabs"
        className="text-sm text-stone-500 hover:text-stone-900"
      >
        ← Back to tabs
      </Link>

      <header className="mt-6 mb-8 rounded-xl border border-l-4 border-stone-200 border-l-[var(--key-accent)] bg-[var(--key-tint)] px-5 py-4">
        <span className="text-xs uppercase tracking-wider text-stone-500">
          Guided practice
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Learn: {tab.title}
        </h1>
        <p className="mt-1 text-stone-600">
          {tab.artist} · 7/4 · {tab.key}
        </p>
      </header>

      <LearnFabienk tab={tab} />
    </main>
  );
}
