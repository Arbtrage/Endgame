"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { ChessboardProvider, Chessboard } from "react-chessboard";
import { getBoardStyles, useBoardStore } from "@/features/game/stores/board-store";
import type { PlayerColor } from "@/features/game/types";

type GameBoardProps = {
  fen: string;
  orientation: "white" | "black";
  canDrag: boolean;
  playerColor?: PlayerColor;
  boardKey?: string;
  checkSquare?: string | null;
  getLegalMovesForSquare?: (square: string) => Array<{ to: string; captured?: string }>;
  onDrop: (source: string, target: string) => boolean;
};

function isPlayerPiece(pieceType: string, playerColor: PlayerColor): boolean {
  const isWhitePiece = pieceType.startsWith("w");
  return playerColor === "white" ? isWhitePiece : !isWhitePiece;
}

export function GameBoard({
  fen,
  orientation,
  canDrag,
  playerColor,
  boardKey,
  checkSquare,
  getLegalMovesForSquare,
  onDrop,
}: GameBoardProps) {
  const theme = useBoardStore((state) => state.theme);
  const styles = getBoardStyles(theme);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  useEffect(() => {
    // Clear selection when the position changes (e.g. opponent moved)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset UI highlight on fen change
    setSelectedSquare(null);
  }, [fen]);

  const clearSelection = useCallback(() => setSelectedSquare(null), []);

  const tryMove = useCallback(
    (source: string, target: string) => {
      if (source === target) {
        clearSelection();
        return false;
      }
      const accepted = onDrop(source, target);
      clearSelection();
      return accepted;
    },
    [clearSelection, onDrop],
  );

  const squareStyles = useMemo(() => {
    const result: Record<string, CSSProperties> = {};

    if (checkSquare) {
      result[checkSquare] = {
        boxShadow: "inset 0 0 0 4px rgba(220, 38, 38, 0.85)",
        backgroundColor: "rgba(220, 38, 38, 0.28)",
      };
    }

    if (!selectedSquare) {
      return result;
    }

    result[selectedSquare] = {
      ...(result[selectedSquare] ?? {}),
      backgroundColor: "rgba(20, 85, 143, 0.55)",
    };

    const legalMoves = getLegalMovesForSquare?.(selectedSquare) ?? [];
    for (const move of legalMoves) {
      result[move.to] = move.captured
        ? {
            boxShadow: "inset 0 0 0 4px rgba(180, 50, 50, 0.55)",
            backgroundColor: "rgba(180, 50, 50, 0.25)",
          }
        : {
            background:
              "radial-gradient(circle, rgba(20, 20, 20, 0.18) 18%, transparent 19%)",
          };
    }

    return result;
  }, [checkSquare, getLegalMovesForSquare, selectedSquare]);

  const handleSquareInteraction = useCallback(
    (square: string, piece: { pieceType: string } | null) => {
      if (!canDrag) return;

      if (!selectedSquare) {
        if (piece && playerColor && isPlayerPiece(piece.pieceType, playerColor)) {
          setSelectedSquare(square);
        }
        return;
      }

      if (square === selectedSquare) {
        clearSelection();
        return;
      }

      if (piece && playerColor && isPlayerPiece(piece.pieceType, playerColor)) {
        setSelectedSquare(square);
        return;
      }

      tryMove(selectedSquare, square);
    },
    [canDrag, clearSelection, playerColor, selectedSquare, tryMove],
  );

  const options = useMemo(
    () => ({
      position: fen,
      boardOrientation: orientation,
      allowDragging: canDrag,
      squareStyles,
      boardStyle: {
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        overflow: "hidden",
        position: "relative" as const,
      },
      canDragPiece: ({
        piece,
      }: {
        piece: { pieceType: string };
        isSparePiece: boolean;
        square: string | null;
      }) => {
        if (!canDrag || !playerColor) return false;
        return isPlayerPiece(piece.pieceType, playerColor);
      },
      onPieceDrop: ({
        sourceSquare,
        targetSquare,
      }: {
        sourceSquare: string | null;
        targetSquare: string | null;
      }) => {
        if (!sourceSquare || !targetSquare) return false;
        return tryMove(sourceSquare, targetSquare);
      },
      onPieceClick: ({
        square,
        piece,
      }: {
        isSparePiece: boolean;
        square: string | null;
        piece: { pieceType: string };
      }) => {
        if (!square) return;
        handleSquareInteraction(square, piece);
      },
      onSquareClick: ({
        piece,
        square,
      }: {
        piece: { pieceType: string } | null;
        square: string;
      }) => {
        handleSquareInteraction(square, piece);
      },
      darkSquareStyle: styles.darkSquareStyle,
      lightSquareStyle: styles.lightSquareStyle,
    }),
    [
      canDrag,
      fen,
      handleSquareInteraction,
      orientation,
      playerColor,
      squareStyles,
      styles.darkSquareStyle,
      styles.lightSquareStyle,
      tryMove,
    ],
  );

  return (
    <div key={boardKey} className="size-full">
      <ChessboardProvider options={options}>
        <Chessboard options={{}} />
      </ChessboardProvider>
    </div>
  );
}
