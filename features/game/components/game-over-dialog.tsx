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
  onOpenChange: (open: boolean) => void;
  lifecycle: GameLifecycleState;
  playerColor: PlayerColor;
  moveCount: number;
  onPlayAgain?: () => void;
};

export function GameOverDialog({
  open,
  onOpenChange,
  lifecycle,
  playerColor,
  moveCount,
  onPlayAgain,
}: GameOverDialogProps) {
  const resultLabel = getResultLabel(lifecycle.result, playerColor);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button type="button" onClick={() => onOpenChange(false)}>
            View replay
          </Button>
          {onPlayAgain ? (
            <Button type="button" variant="outline" onClick={onPlayAgain}>
              Play again
            </Button>
          ) : (
            <Button
              render={<Link href="/play/computer" />}
              nativeButton={false}
              variant="outline"
            >
              Play again
            </Button>
          )}
          <Button
            render={<Link href="/dashboard" />}
            nativeButton={false}
            variant="ghost"
          >
            Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
