"use client";

import type { ReactNode } from "react";
import { GameControls } from "@/features/game/components/game-controls";
import { GameReplayControls } from "@/features/game/components/game-replay-controls";
import { MoveList } from "@/features/game/components/move-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import type { GameMove } from "@/features/game/types";

type GameSidebarPanelProps = {
  moves: GameMove[];
  activeIndex: number | null;
  onSelectMove: (index: number) => void;
  onResign: () => void;
  onFlipBoard: () => void;
  onOfferDraw?: () => void;
  onGoLive?: () => void;
  disabled?: boolean;
  isFinished?: boolean;
  drawOfferPending?: boolean;
  topSlot?: ReactNode;
  bottomSlot?: ReactNode;
};

export function GameSidebarPanel({
  moves,
  activeIndex,
  onSelectMove,
  onResign,
  onFlipBoard,
  onOfferDraw,
  onGoLive,
  disabled = false,
  isFinished = false,
  drawOfferPending = false,
  topSlot,
  bottomSlot,
}: GameSidebarPanelProps) {
  const movePairs = Math.ceil(moves.length / 2);

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="shrink-0 border-b py-3">
        <CardTitle className="text-base">Moves</CardTitle>
        <CardDescription>
          {moves.length === 0
            ? isFinished
              ? "Replay the game move by move"
              : "Make the first move on the board"
            : activeIndex !== null
              ? "Reviewing — use arrows or click a move · Live to resume"
              : isFinished
                ? "Replay the game move by move"
                : `${movePairs} full ${movePairs === 1 ? "move" : "moves"} · ← → to step`}
        </CardDescription>
      </CardHeader>

      {moves.length > 0 ? (
        <GameReplayControls
          moveCount={moves.length}
          activeIndex={activeIndex}
          onSelectMove={onSelectMove}
          onGoLive={onGoLive ?? (() => onSelectMove(moves.length - 1))}
        />
      ) : null}

      {topSlot ? (
        <div className="shrink-0 border-b px-3 py-2.5 sm:px-4 sm:py-3">{topSlot}</div>
      ) : null}

      <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
        <MoveList
          moves={moves}
          activeIndex={activeIndex}
          onSelectMove={onSelectMove}
        />
      </CardContent>

      {bottomSlot ? (
        <div className="shrink-0 border-t px-3 py-2.5 sm:px-4 sm:py-3">{bottomSlot}</div>
      ) : null}

      <CardFooter className="shrink-0 flex-col gap-2 border-t pt-3">
        <GameControls
          onResign={onResign}
          onFlipBoard={onFlipBoard}
          onOfferDraw={onOfferDraw}
          disabled={disabled}
          hideResign={isFinished}
          hideDrawOffer={isFinished}
          drawOfferPending={drawOfferPending}
        />
      </CardFooter>
    </Card>
  );
}
