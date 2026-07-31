"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PromotionDialog } from "@/features/game/components/promotion-dialog";
import { ChessGame } from "@/features/game/engine/chess-game";
import { Skeleton } from "@/shared/ui/skeleton";

const DynamicGameBoard = dynamic(
  () =>
    import("@/features/game/components/game-board").then(
      (module) => module.GameBoard,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-sm" />,
  },
);

type PuzzleBoardProps = {
  fen: string;
  exerciseKey: string;
  disabled?: boolean;
  onMove: (uci: string) => Promise<boolean>;
};

export function PuzzleBoard({
  fen,
  exerciseKey,
  disabled = false,
  onMove,
}: PuzzleBoardProps) {
  const gameRef = useRef(new ChessGame(fen));
  const [displayFen, setDisplayFen] = useState(fen);
  const [verifying, setVerifying] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const resetPosition = useCallback(() => {
    gameRef.current = new ChessGame(fen);
    setDisplayFen(fen);
    setPendingPromotion(null);
  }, [fen]);

  useEffect(() => {
    resetPosition();
    setVerifying(false);
  }, [exerciseKey, resetPosition]);

  const orientation = useMemo(() => {
    const sideToMove = fen.split(" ")[1];
    return sideToMove === "b" ? "black" : "white";
  }, [fen, exerciseKey]);

  const canInteract = !disabled && !verifying && !pendingPromotion;

  const attemptMove = useCallback(
    async (from: string, to: string, promotion?: string) => {
      if (!canInteract) return;

      const legalMoves = gameRef.current.getLegalMoves(from);
      const needsPromotion = legalMoves.some(
        (move) => move.from === from && move.to === to && move.promotion,
      );

      if (needsPromotion && !promotion) {
        setPendingPromotion({ from, to });
        return;
      }

      const move = gameRef.current.makeMove(from, to, promotion);
      if (!move) return;

      const uci = `${from}${to}${promotion ?? ""}`;
      setDisplayFen(gameRef.current.getFen());
      setVerifying(true);

      try {
        const accepted = await onMove(uci);
        if (!accepted) {
          resetPosition();
        }
      } finally {
        setVerifying(false);
      }
    },
    [canInteract, onMove, resetPosition],
  );

  const handleDrop = useCallback(
    (source: string, target: string) => {
      if (!canInteract) return false;

      const legalMoves = gameRef.current.getLegalMoves(source);
      const matchingMoves = legalMoves.filter(
        (move) => move.from === source && move.to === target,
      );
      if (matchingMoves.length === 0) {
        return false;
      }

      const needsPromotion = matchingMoves.some((move) => move.promotion);
      void attemptMove(source, target);
      return !needsPromotion;
    },
    [attemptMove, canInteract],
  );

  const getLegalMovesForSquare = useCallback(
    (square: string) => gameRef.current.getLegalMoves(square),
    [displayFen],
  );

  return (
    <div className="relative size-full">
      <DynamicGameBoard
        fen={displayFen}
        orientation={orientation}
        canDrag={canInteract}
        playerColor={orientation}
        boardKey={exerciseKey}
        getLegalMovesForSquare={getLegalMovesForSquare}
        onDrop={handleDrop}
      />

      <PromotionDialog
        open={!!pendingPromotion}
        color={orientation}
        onSelect={(piece) => {
          if (pendingPromotion) {
            void attemptMove(
              pendingPromotion.from,
              pendingPromotion.to,
              piece,
            );
            setPendingPromotion(null);
          }
        }}
        onClose={() => setPendingPromotion(null)}
      />
    </div>
  );
}
