"use client";

import { Loader2 } from "lucide-react";
import type { AnalyzedMove } from "../types";

type ExplainMovePanelProps = {
  move: AnalyzedMove | null;
  explanation: string | null;
  loading?: boolean;
  onExplain?: () => void;
};

export function ExplainMovePanel({
  move,
  explanation,
  loading,
  onExplain,
}: ExplainMovePanelProps) {
  if (!move) {
    return (
      <p className="text-sm text-muted-foreground">
        Select a move to see details and request an explanation.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">
          Move {move.moveNumber}: {move.san}
        </p>
        <p className="text-xs text-muted-foreground">
          Eval {move.evalBefore} → {move.evalAfter} cp · Best: {move.bestMove}
        </p>
      </div>
      {explanation ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {explanation}
        </p>
      ) : loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Explaining…
        </div>
      ) : onExplain ? (
        <button
          type="button"
          onClick={onExplain}
          className="text-sm font-medium text-primary hover:underline"
        >
          Explain this move
        </button>
      ) : null}
    </div>
  );
}
