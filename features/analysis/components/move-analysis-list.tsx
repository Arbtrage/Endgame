"use client";

import type { AnalyzedMove } from "../types";
import { ClassificationBadge } from "./classification-badge";
import { cn } from "@/shared/lib/utils";

type MoveAnalysisListProps = {
  moves: AnalyzedMove[];
  selectedMoveNumber: number | null;
  onSelectMove: (moveNumber: number) => void;
};

export function MoveAnalysisList({
  moves,
  selectedMoveNumber,
  onSelectMove,
}: MoveAnalysisListProps) {
  if (moves.length === 0) {
    return (
      <p className="p-4 text-sm text-muted-foreground">No moves to display.</p>
    );
  }

  return (
    <div className="overflow-y-auto">
      <ul className="divide-y divide-border/50">
        {moves.map((move) => (
          <li key={move.moveNumber}>
            <button
              type="button"
              onClick={() => onSelectMove(move.moveNumber)}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/40",
                selectedMoveNumber === move.moveNumber && "bg-primary/10",
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">
                  {move.moveNumber}
                </span>
                <span className="font-medium">{move.san}</span>
                {move.isUserMove ? (
                  <ClassificationBadge
                    classification={move.classification}
                    compact
                  />
                ) : null}
              </span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {move.evalAfter > 0 ? "+" : ""}
                {(move.evalAfter / 100).toFixed(1)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
