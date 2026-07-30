"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import {
  formatResultReason,
  getResultLabel,
} from "@/features/game/engine/game-lifecycle";
import type { GameLifecycleState } from "@/features/game/engine/game-lifecycle";
import type { PlayerColor } from "@/features/game/types";

type GameOverDialogProps = {
  open: boolean;
  lifecycle: GameLifecycleState;
  playerColor: PlayerColor;
  moveCount: number;
  gameId?: string | null;
  onPlayAgain?: () => void;
};

export function GameOverDialog({
  open,
  lifecycle,
  playerColor,
  moveCount,
  onPlayAgain,
}: GameOverDialogProps) {
  const resultLabel = getResultLabel(lifecycle.result, playerColor);

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Game over</DialogTitle>
          <DialogDescription>
            {resultLabel}
            {lifecycle.resultReason
              ? ` by ${formatResultReason(lifecycle.resultReason)}`
              : ""}
            {" · "}
            {moveCount} moves
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-start">
          {onPlayAgain ? (
            <Button onClick={onPlayAgain}>Play again</Button>
          ) : (
            <Link
              href="/play/computer"
              className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground"
            >
              Play again
            </Link>
          )}
          <Link
            href="/dashboard"
            className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium shadow-xs"
          >
            Dashboard
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
