import type { MoveClassification } from "@/shared/engine/classification";
import { CLASSIFICATION_LABELS } from "@/shared/engine/classification";
import { cn } from "@/shared/lib/utils";

const CLASSIFICATION_VARS: Record<MoveClassification, string> = {
  brilliant: "var(--move-brilliant)",
  best: "var(--move-great)",
  great: "var(--move-great)",
  good: "var(--move-good)",
  inaccuracy: "var(--move-inaccuracy)",
  mistake: "var(--move-mistake)",
  blunder: "var(--move-blunder)",
};

type ClassificationBadgeProps = {
  classification: MoveClassification;
  compact?: boolean;
};

export function ClassificationBadge({
  classification,
  compact,
}: ClassificationBadgeProps) {
  const color = CLASSIFICATION_VARS[classification];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md font-medium",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
      )}
      style={{
        backgroundColor: `color-mix(in oklch, ${color} 18%, transparent)`,
        color,
      }}
    >
      {CLASSIFICATION_LABELS[classification]}
    </span>
  );
}
