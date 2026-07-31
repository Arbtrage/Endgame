import type { MoveClassification } from "@/shared/engine/classification";
import { CLASSIFICATION_LABELS } from "@/shared/engine/classification";
import { cn } from "@/shared/lib/utils";

const CLASSIFICATION_STYLES: Record<MoveClassification, string> = {
  brilliant: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  best: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  great: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  good: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  inaccuracy: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  mistake: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  blunder: "bg-red-500/15 text-red-700 dark:text-red-300",
};

type ClassificationBadgeProps = {
  classification: MoveClassification;
  compact?: boolean;
};

export function ClassificationBadge({
  classification,
  compact,
}: ClassificationBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md font-medium",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        CLASSIFICATION_STYLES[classification],
      )}
    >
      {CLASSIFICATION_LABELS[classification]}
    </span>
  );
}
