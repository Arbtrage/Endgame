"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  formatResultReason,
  getResultLabel,
} from "@/features/game/engine/game-lifecycle";
import type { GameLifecycleState } from "@/features/game/engine/game-lifecycle";
import type { PlayerColor } from "@/features/game/types";

type GameResultBannerProps = {
  lifecycle: GameLifecycleState;
  playerColor: PlayerColor;
  moveCount: number;
  onShowSummary?: () => void;
};

export function GameResultBanner({
  lifecycle,
  playerColor,
  moveCount,
  onShowSummary,
}: GameResultBannerProps) {
  const resultLabel = getResultLabel(lifecycle.result, playerColor);
  const reason = lifecycle.resultReason
    ? formatResultReason(lifecycle.resultReason)
    : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Trophy className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="font-medium">{resultLabel}</p>
          <p className="text-xs text-muted-foreground">
            {reason ? `${reason} · ` : ""}
            {moveCount} moves · Click moves in the list to replay
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onShowSummary ? (
          <Button type="button" variant="outline" size="sm" onClick={onShowSummary}>
            Summary
          </Button>
        ) : null}
        <Button render={<Link href="/dashboard" />} nativeButton={false} size="sm" variant="ghost">
          Dashboard
        </Button>
      </div>
    </div>
  );
}
