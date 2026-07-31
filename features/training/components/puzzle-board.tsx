"use client";

import { GameBoard } from "@/features/game/components/game-board";
import { ChessGame } from "@/features/game/engine/chess-game";

type PuzzleBoardProps = {
  fen: string;
  onMove: (uci: string) => void;
};

export function PuzzleBoard({ fen, onMove }: PuzzleBoardProps) {
  const game = new ChessGame(fen);
  const turn = game.turn() === "w" ? "white" : "black";

  return (
    <GameBoard
      fen={fen}
      orientation={turn}
      canDrag={true}
      playerColor={turn}
      onDrop={(from, to) => {
        const move = game.makeMove(from, to);
        if (!move) return false;
        const uci = `${from}${to}${move.promotion ?? ""}`;
        onMove(uci);
        return true;
      }}
    />
  );
}
