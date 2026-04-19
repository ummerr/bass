import Link from "next/link";
import type { Metadata } from "next";
import { NoteRecognitionDrill } from "./NoteRecognitionDrill";

export const metadata: Metadata = {
  title: "Fretboard notes drill",
  description:
    "Silent note-recognition drill — one string at a time, 12 prompts per round.",
};

type StringName = "E" | "A" | "D" | "G";
const VALID: Set<StringName> = new Set(["E", "A", "D", "G"]);

export default async function FretboardNotesDrillPage({
  searchParams,
}: {
  searchParams: Promise<{ string?: string }>;
}) {
  const params = await searchParams;
  const requested = (params.string ?? "").toUpperCase() as StringName;
  const initialString = VALID.has(requested) ? requested : "E";

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
          Drill
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Fretboard notes
        </h1>
        <p className="mt-2 text-stone-600">
          Twelve prompts per round, one string at a time. Say the note out
          loud before you tap — the research says speaking the note is what
          moves it into long-term memory.
        </p>
      </header>

      <NoteRecognitionDrill initialString={initialString} />
    </main>
  );
}
