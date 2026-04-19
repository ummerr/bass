import { type LessonStatus, STATUS_LABELS } from "@/lib/lessons";

const STATUS_CLASSES: Record<LessonStatus, string> = {
  "not-started": "bg-neutral-100 text-neutral-600 border-neutral-200",
  learning: "bg-amber-50 text-amber-800 border-amber-200",
  practicing: "bg-sky-50 text-sky-800 border-sky-200",
  comfortable: "bg-emerald-50 text-emerald-800 border-emerald-200",
  retired: "bg-slate-100 text-slate-600 border-slate-200",
};

export function StatusBadge({ status }: { status: LessonStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
