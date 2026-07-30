"use client";

import type { ReactNode } from "react";
import { GameControls } from "@/features/game/components/game-controls";
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
  disabled?: boolean;
  topSlot?: ReactNode;
};

export function GameSidebarPanel({
  moves,
  activeIndex,
  onSelectMove,
  onResign,
  onFlipBoard,
  disabled = false,
  topSlot,
}: GameSidebarPanelProps) {
  const movePairs = Math.ceil(moves.length / 2);

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="shrink-0 border-b py-3">
        <CardTitle className="text-base">Moves</CardTitle>
        <CardDescription>
          {moves.length === 0
            ? "Make the first move on the board"
            : `${movePairs} full ${movePairs === 1 ? "move" : "moves"}`}
        </CardDescription>
      </CardHeader>

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
        />
      </CardFooter>
    </Card>
  );
}
