import type { Metadata } from "next";
import FretboardExplorer from "./FretboardExplorer";

export const metadata: Metadata = {
  title: "Fretboard",
  description:
    "Every note on a 4-string bass, laid out flat. Defaults to all notes; scale presets are one click away.",
};

export default async function FretboardPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string }>;
}) {
  const { preset } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-stone-500">
          Visualize
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Fretboard
        </h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Every note on a 4-string bass. The red dot is the note you&apos;re
          centered on.
        </p>
      </header>
      <FretboardExplorer initialPresetId={preset} />
    </main>
  );
}
