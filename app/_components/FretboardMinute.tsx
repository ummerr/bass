"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Target = { string: "E" | "A" | "D" | "G" | null; label: string };

function targetForDay(dow: number): Target {
  switch (dow) {
    case 1:
      return { string: "E", label: "E string" };
    case 2:
      return { string: "A", label: "A string" };
    case 3:
      return { string: "D", label: "D string" };
    case 4:
      return { string: "G", label: "G string" };
    case 5:
      return { string: "E", label: "E string" };
    case 6:
      return { string: "A", label: "A string" };
    default:
      return { string: null, label: "any string you like" };
  }
}

export function FretboardMinute() {
  const [target, setTarget] = useState<Target>({ string: null, label: "…" });

  useEffect(() => {
    const now = new Date();
    setTarget(targetForDay(now.getDay()));
  }, []);

  const drillHref = target.string
    ? `/drills/fretboard-notes?string=${target.string}`
    : "/drills/fretboard-notes";

  return (
    <>
      <p className="mt-1 text-sm text-stone-600">
        Today: <strong className="text-stone-900">{target.label}</strong>.
        Say each note out loud as you play it — open to twelve and back.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={drillHref}
          className="inline-flex items-center rounded-md bg-amber-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-800"
        >
          Start drill →
        </Link>
        <Link
          href="/fretboard"
          className="inline-flex items-center rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-900 transition hover:border-stone-900"
        >
          Open fretboard
        </Link>
      </div>
    </>
  );
}
