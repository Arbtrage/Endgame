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
  onGoLive?: () => void;
  disabled?: boolean;
  isFinished?: boolean;
  topSlot?: ReactNode;
};

export function GameSidebarPanel({
  moves,
  activeIndex,
  onSelectMove,
  onResign,
  onFlipBoard,
  onGoLive,
  disabled = false,
  isFinished = false,
  topSlot,
}: GameSidebarPanelProps) {
  const movePairs = Math.ceil(moves.length / 2);

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="shrink-0 border-b py-3">
        <CardTitle className="text-base">Moves</CardTitle>
        <CardDescription>
          {isFinished
            ? "Replay the game move by move"
            : moves.length === 0
              ? "Make the first move on the board"
              : `${movePairs} full ${movePairs === 1 ? "move" : "moves"}`}
        </CardDescription>
      </CardHeader>

      {isFinished ? (
        <GameReplayControls
          moveCount={moves.length}
          activeIndex={activeIndex}
          onSelectMove={onSelectMove}
          onGoLive={onGoLive ?? (() => onSelectMove(moves.length - 1))}
        />
      ) : null}

      {topSlot ? (
        <div className="shrink-0 border-b px-4 py-3">{topSlot}</div>
      ) : null}

      <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
        <MoveList
          moves={moves}
          activeIndex={activeIndex}
          onSelectMove={onSelectMove}
        />
      </CardContent>

      <CardFooter className="shrink-0 flex-col gap-2 sm:flex-row">
        <GameControls
          onResign={onResign}
          onFlipBoard={onFlipBoard}
          disabled={disabled}
          hideResign={isFinished}
        />
      </CardFooter>
    </Card>
  );
}
