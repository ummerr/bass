import type { BassString } from "@/lib/tabs/schema";

export function OrientationLegend({
  order,
  flipped,
}: {
  order: BassString[];
  flipped: boolean;
}) {
  const topLabel = flipped ? "Low" : "High";
  const bottomLabel = flipped ? "High" : "Low";
  const caption = flipped
    ? "top row is the lowest-pitched string — as your bass looks from above"
    : "top row is the highest-pitched string, like sheet music";

  return (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-xs text-stone-600"
      role="note"
      aria-label="String orientation legend"
    >
      <span className="font-medium text-stone-800">{topLabel}</span>
      <span aria-hidden>↑</span>
      <span className="font-mono tracking-widest text-stone-700">
        {order.join(" — ")}
      </span>
      <span aria-hidden>↓</span>
      <span className="font-medium text-stone-800">{bottomLabel}</span>
      <span aria-hidden className="text-stone-400">
        ·
      </span>
      <span className="text-stone-500">{caption}</span>
    </div>
  );
}
