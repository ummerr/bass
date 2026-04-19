import type { HeatmapDay } from "@/lib/practice";

const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;

function levelFor(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes <= 0) return 0;
  if (minutes <= 15) return 1;
  if (minutes <= 30) return 2;
  if (minutes <= 60) return 3;
  return 4;
}

const LEVEL_FILL: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "#f0ead9",
  1: "#fde68a",
  2: "#fbbf24",
  3: "#d97706",
  4: "#78350f",
};

export function Heatmap({ days }: { days: HeatmapDay[] }) {
  if (days.length === 0) return null;

  const weeks = Math.ceil(days.length / 7);
  const width = weeks * STEP - GAP;
  const height = 7 * STEP - GAP;

  return (
    <div className="flex flex-col gap-2">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-full"
        role="img"
        aria-label="Practice heatmap, last 90 days"
      >
        {days.map((d, i) => {
          const col = Math.floor(i / 7);
          const row = i % 7;
          const x = col * STEP;
          const y = row * STEP;
          if (d.isFuture) return null;
          if (!d.inRange) {
            return (
              <rect
                key={d.date}
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx={2}
                fill="transparent"
              />
            );
          }
          const level = levelFor(d.minutes);
          const title =
            d.minutes > 0
              ? `${d.date} · ${d.minutes} min${d.note ? " · " + d.note.split("\n")[0].slice(0, 60) : ""}`
              : `${d.date} · no entry`;
          return (
            <rect
              key={d.date}
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              rx={2}
              fill={LEVEL_FILL[level]}
              stroke={d.isToday ? "#1c1917" : "none"}
              strokeWidth={d.isToday ? 1.5 : 0}
            >
              <title>{title}</title>
            </rect>
          );
        })}
      </svg>
      <div className="flex items-center gap-2 text-[11px] text-stone-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span
            key={l}
            className="inline-block h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: LEVEL_FILL[l as 0 | 1 | 2 | 3 | 4] }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
