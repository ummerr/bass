"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Props = {
  availableTechniques: string[];
  availableKeys: string[];
};

const DIFFICULTIES = [1, 2, 3, 4, 5];

function parseCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function TabFilters({ availableTechniques, availableKeys }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [moreOpen, setMoreOpen] = useState(false);

  const difficulties = parseCsv(searchParams.get("d"));
  const techniques = parseCsv(searchParams.get("t"));
  const currentKey = searchParams.get("k") ?? "";

  function update(next: { d?: string[]; t?: string[]; k?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const set = (key: string, value: string) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };
    if (next.d !== undefined) set("d", next.d.join(","));
    if (next.t !== undefined) set("t", next.t.join(","));
    if (next.k !== undefined) set("k", next.k);
    const qs = params.toString();
    router.replace(qs ? `/tabs?${qs}` : "/tabs", { scroll: false });
  }

  const hasAnyFilter =
    difficulties.length > 0 || techniques.length > 0 || currentKey !== "";
  const hasMore = availableTechniques.length > 0 || availableKeys.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs uppercase tracking-wider text-stone-500">
          Difficulty
        </span>
        {DIFFICULTIES.map((d) => {
          const active = difficulties.includes(String(d));
          return (
            <button
              key={d}
              type="button"
              onClick={() => update({ d: toggle(difficulties, String(d)) })}
              className={`rounded-md border px-2.5 py-1 text-sm font-medium transition ${
                active
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
              }`}
            >
              {d}
            </button>
          );
        })}
        {hasAnyFilter && (
          <button
            type="button"
            onClick={() => update({ d: [], t: [], k: "" })}
            className="text-xs text-stone-500 hover:text-stone-900"
          >
            clear
          </button>
        )}
        {hasMore && (
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="ml-auto text-xs uppercase tracking-wider text-stone-500 hover:text-stone-900"
          >
            {moreOpen ? "Fewer filters" : "More filters"}
          </button>
        )}
      </div>

      {moreOpen && hasMore && (
        <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-amber-50/40 p-3">
          {availableTechniques.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs uppercase tracking-wider text-stone-500">
                Technique
              </span>
              {availableTechniques.map((t) => {
                const active = techniques.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update({ t: toggle(techniques, t) })}
                    className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                      active
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
          {availableKeys.length > 0 && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="tab-key-filter"
                className="text-xs uppercase tracking-wider text-stone-500"
              >
                Key
              </label>
              <select
                id="tab-key-filter"
                value={currentKey}
                onChange={(e) => update({ k: e.target.value })}
                className="rounded-md border border-stone-200 bg-white px-2 py-1 text-sm text-stone-700"
              >
                <option value="">Any key</option>
                {availableKeys.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
