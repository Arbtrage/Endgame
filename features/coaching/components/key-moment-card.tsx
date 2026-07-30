"use client";

import { Badge } from "@/shared/ui/badge";
import type { CoachExplanation } from "@/features/coaching/types";

type KeyMomentCardProps = {
  moment: CoachExplanation;
};

export function KeyMomentCard({ moment }: KeyMomentCardProps) {
  const swing = moment.evalAfter - moment.evalBefore;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center justify-between gap-2">
        <Badge>{moment.momentType}</Badge>
        <span className="text-xs text-muted-foreground">
          Move {moment.moveNumber}: {moment.san}
        </span>
      </div>
      <p className="mt-2 text-sm">{moment.explanation}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Eval swing: {swing > 0 ? "+" : ""}
        {swing} cp
      </p>
    </div>
  );
}
