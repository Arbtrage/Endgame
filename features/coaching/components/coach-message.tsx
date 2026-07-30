"use client";

import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

type CoachMessageProps = {
  explanation: string;
  momentType: string;
  concepts?: string[];
  className?: string;
};

const momentLabels: Record<string, string> = {
  blunder: "Blunder",
  brilliant: "Brilliant",
  opening_exit: "Opening",
  endgame_entry: "Endgame",
  check: "Check",
  material_change: "Capture",
};

export function CoachMessage({
  explanation,
  momentType,
  concepts = [],
  className,
}: CoachMessageProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/30 p-3 text-sm",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Badge variant="secondary">
          {momentLabels[momentType] ?? momentType}
        </Badge>
      </div>
      <p>{explanation}</p>
      {concepts.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {concepts.map((concept) => (
            <Badge key={concept} variant="outline" className="text-xs">
              {concept}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
