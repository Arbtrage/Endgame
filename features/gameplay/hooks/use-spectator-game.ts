"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChessGame } from "@/features/game/engine/chess-game";
import type { GameMove, PlayerColor } from "@/features/game/types";
import { getGameplayGame } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";

function toGameMoves(
  moves: Array<{
    moveNumber: number;
    san: string;
    uci: string;
    fen: string;
    color: string;
  }>,
): GameMove[] {
  return moves.map((move) => ({
    moveNumber: move.moveNumber,
    san: move.san,
    uci: move.uci,
    fen: move.fen,
    color: move.color as PlayerColor,
  }));
}

function buildChessGame(moves: GameMove[]): ChessGame {
  const chessGame = new ChessGame();
  moves.forEach((move) => {
    chessGame.makeMoveUci(move.uci);
  });
  return chessGame;
}

export function useSpectatorGame(gameId: string) {
  const chessGameRef = useRef(new ChessGame());
  const reviewIndexRef = useRef<number | null>(null);
  const [moves, setMoves] = useState<GameMove[]>([]);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const [fen, setFen] = useState(new ChessGame().getFen());
  const [inCheck, setInCheck] = useState(false);
  const [checkSquare, setCheckSquare] = useState<string | null>(null);

  const syncBoardState = useCallback((chessGame: ChessGame) => {
    const checked = chessGame.isCheck();
    setFen(chessGame.getFen());
    setInCheck(checked);
    setCheckSquare(checked ? chessGame.getKingSquare() : null);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.gameplay.detail(gameId),
    queryFn: () => getGameplayGame(gameId),
    refetchInterval: (query) =>
      query.state.data?.status === "IN_PROGRESS" ? 2000 : false,
  });

  useEffect(() => {
    reviewIndexRef.current = reviewIndex;
  }, [reviewIndex]);

  useEffect(() => {
    if (!data) return;

    const nextMoves = toGameMoves(data.moves);
    const chessGame = buildChessGame(nextMoves);
    const reviewing = reviewIndexRef.current;

    if (reviewing !== null && nextMoves.length > 0) {
      const clamped = Math.min(reviewing, nextMoves.length - 1);
      chessGame.goToMove(clamped);
      if (clamped !== reviewing) {
        setReviewIndex(clamped);
      }
    }

    chessGameRef.current = chessGame;
    setMoves(nextMoves);
    syncBoardState(chessGame);
  }, [data, syncBoardState]);

  const goToMove = useCallback((index: number) => {
    chessGameRef.current.goToMove(index);
    setReviewIndex(index);
    syncBoardState(chessGameRef.current);
  }, [syncBoardState]);

  const exitReview = useCallback(() => {
    chessGameRef.current.exitReview();
    setReviewIndex(null);
    syncBoardState(chessGameRef.current);
  }, [syncBoardState]);

  return {
    game: data,
    loading: isLoading,
    error: isError ? (error instanceof Error ? error.message : "Failed to load game") : null,
    moves,
    fen,
    reviewIndex,
    goToMove,
    exitReview,
    inCheck,
    checkSquare,
    isLive: data?.status === "IN_PROGRESS",
    orientation: (data?.playerColor ?? "white") as PlayerColor,
  };
}
