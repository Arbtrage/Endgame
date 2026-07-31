"use client";

import { GameBoard } from "@/features/game/components/game-board";

type AnalysisBoardProps = {
  fen: string;
  orientation: "white" | "black";
  bestMove?: string;
};

export function AnalysisBoard({
  fen,
  orientation,
}: AnalysisBoardProps) {
  return (
    <GameBoard
      fen={fen}
      orientation={orientation}
      canDrag={false}
      onDrop={() => false}
    />
  );
}
