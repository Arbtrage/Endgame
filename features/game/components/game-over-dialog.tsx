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
  gameId?: string;
  onPlayAgain?: () => void;
  playAgainLabel?: string;
  playAgainDisabled?: boolean;
  playAgainHint?: string;
  analysisHint?: string;
};

export function GameOverDialog({
  open,
  onOpenChange,
  lifecycle,
  playerColor,
  moveCount,
  gameId,
  onPlayAgain,
  playAgainLabel = "Play again",
  playAgainDisabled = false,
  playAgainHint,
  analysisHint,
}: GameOverDialogProps) {
  const resultLabel = getResultLabel(lifecycle.result, playerColor);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
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
        {playAgainHint ? (
          <p className="text-sm text-muted-foreground">{playAgainHint}</p>
        ) : null}
        {analysisHint ? (
          <p className="text-xs text-muted-foreground">{analysisHint}</p>
        ) : null}
        <DialogFooter className="grid grid-cols-2 gap-2">
          <Button type="button" className="w-full" onClick={() => onOpenChange(false)}>
            View replay
          </Button>
          {gameId ? (
            <Button
              render={<Link href={`/analyze/${gameId}`} />}
              nativeButton={false}
              variant="secondary"
              className="w-full"
            >
              Analyze
            </Button>
          ) : null}
          {onPlayAgain ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={playAgainDisabled}
              onClick={onPlayAgain}
            >
              {playAgainLabel}
            </Button>
          ) : (
            <Button
              render={<Link href="/play/computer" />}
              nativeButton={false}
              variant="outline"
              className="w-full"
            >
              Play again
            </Button>
          )}
          <Button
            render={<Link href="/dashboard" />}
            nativeButton={false}
            variant="ghost"
            className="w-full"
          >
            Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
