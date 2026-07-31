"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { generatePgn } from "@/features/game/engine/pgn";
import {
  resolveGameResult,
  type GameLifecycleState,
} from "@/features/game/engine/game-lifecycle";
import { chessTurnToColor, colorToChessTurn } from "@/features/game/types";
import type { GameMove, PlayerColor } from "@/features/game/types";
import { useBoardStore } from "@/features/game/stores/board-store";
import { useGameStore } from "@/features/game/stores/game-store";
import {
  completeGame,
  getGame,
  resignGame,
} from "@/shared/api/fetcher";
import { requestEngineBestMove } from "@/shared/engine/request-engine-move";
import { useGameSessionReset } from "@/features/game/hooks/use-game-session";
import { useGameClock } from "@/features/game/hooks/use-game-clock";
import { useMoveSync } from "@/features/game/hooks/use-move-sync";

type UseComputerGameOptions = {
  gameId: string;
  persist?: boolean;
};

export function useComputerGame({ gameId, persist = true }: UseComputerGameOptions) {
  const {
    playerColor,
    stockfishLevel,
    chessGame,
    phase,
    lifecycle,
    moves,
    reviewIndex,
    opponentThinking,
    engineError,
    pendingPromotion,
    initGame,
    setPhase,
    setLifecycle,
    addMove,
    setOpponentThinking,
    setEngineError,
    setPendingPromotion,
    goToMove,
    exitReview,
  } = useGameStore();

  const orientation = useBoardStore((state) => state.orientation);
  const setOrientation = useBoardStore((state) => state.setOrientation);
  const [loading, setLoading] = useState(true);
  const [loadedAsCompleted, setLoadedAsCompleted] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [timeControlInitial, setTimeControlInitial] = useState<number | null>(
    null,
  );
  const [timeControlIncrement, setTimeControlIncrement] = useState<
    number | null
  >(null);
  const processingRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { persistMove, syncInProgressRef } = useMoveSync(gameId, persist);

  useGameSessionReset(gameId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadedAsCompleted(false);
      try {
        if (persist) {
          const game = await getGame(gameId);
          if (cancelled) return;
          initGame({
            gameId,
            playerColor: game.playerColor as PlayerColor,
            stockfishLevel: game.stockfishLevel ?? 5,
            moves: game.moves as GameMove[],
          });
          setTimeControlInitial(game.timeControlInitial);
          setTimeControlIncrement(game.timeControlIncrement);
          setOrientation(game.playerColor as "white" | "black");
          if (game.status === "COMPLETED") {
            setLoadedAsCompleted(true);
            setPhase("game_over");
            setLifecycle({
              phase: "game_over",
              result: game.result as GameLifecycleState["result"],
              resultReason: game.resultReason as GameLifecycleState["resultReason"],
            });
          }
        } else {
          initGame({
            gameId,
            playerColor: "white",
            stockfishLevel: 3,
          });
        }
      } catch {
        toast.error("Unable to load game");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [gameId, initGame, persist, setLifecycle, setOrientation, setPhase]);

  useEffect(() => {
    let cancelled = false;
    import("@/shared/engine/stockfish-engine").then(({ getStockfishEngine }) =>
      getStockfishEngine()
        .ready()
        .then(() => {
          if (!cancelled) {
            getStockfishEngine().setSkillLevel(stockfishLevel);
            setEngineReady(true);
            setEngineError(null);
          }
        })
        .catch((error: Error) => {
          if (!cancelled) {
            setEngineError(error.message);
          }
        }),
    );

    return () => {
      cancelled = true;
    };
  }, [setEngineError, stockfishLevel]);

  const isPlayerTurn = useCallback(() => {
    return chessGame.turn() === colorToChessTurn(playerColor);
  }, [chessGame, playerColor]);

  const finalizeIfOver = useCallback(async () => {
    if (!chessGame.isGameOver()) {
      return false;
    }

    let nextLifecycle: GameLifecycleState;
    if (chessGame.isCheckmate()) {
      const winner = chessTurnToColor(chessGame.turn() === "w" ? "b" : "w");
      nextLifecycle = resolveGameResult(playerColor, "checkmate", winner);
    } else {
      const reason =
        (chessGame.getDrawReason() as GameLifecycleState["resultReason"]) ??
        "draw";
      nextLifecycle = resolveGameResult(playerColor, reason);
    }

    setLifecycle(nextLifecycle);
    setPhase("game_over");

    if (persist && nextLifecycle.result) {
      await completeGame(gameId, {
        result: nextLifecycle.result,
        resultReason: nextLifecycle.resultReason ?? "draw",
        pgn: generatePgn(chessGame, {
          Result:
            nextLifecycle.result === "WHITE_WIN"
              ? "1-0"
              : nextLifecycle.result === "BLACK_WIN"
                ? "0-1"
                : "1/2-1/2",
        }),
        finalFen: chessGame.getLiveFen(),
      });
    }

    return true;
  }, [chessGame, gameId, persist, playerColor, setLifecycle, setPhase]);

  const requestOpponentMove = useCallback(async () => {
    if (processingRef.current || phase === "game_over") return;
    processingRef.current = true;
    setOpponentThinking(true);

    try {
      const best = await requestEngineBestMove(
        chessGame.getLiveFen(),
        chessGame.getHistoryUci(),
        stockfishLevel,
      );

      const move = chessGame.makeMoveUci(best.uci);
      if (!move) {
        throw new Error("Engine returned an illegal move");
      }

      const record: GameMove = {
        moveNumber: moves.length + 1,
        san: move.san,
        uci: best.uci,
        fen: chessGame.getLiveFen(),
        color: chessTurnToColor(move.color),
      };

      addMove(record);
      setOpponentThinking(false);

      if (persist) {
        await persistMove(record);
      }

      try {
        await finalizeIfOver();
      } catch {
        toast.error("Failed to save game result");
      }

      setEngineError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Opponent failed to move";
      setEngineError(message);
      toast.error(message);
      if (!lifecycle.result && !isPlayerTurn()) {
        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          void requestOpponentMove();
        }, 1500);
      }
    } finally {
      setOpponentThinking(false);
      processingRef.current = false;
    }
  }, [
    addMove,
    chessGame,
    finalizeIfOver,
    moves.length,
    persist,
    persistMove,
    isPlayerTurn,
    lifecycle.result,
    setEngineError,
    setOpponentThinking,
    stockfishLevel,
  ]);

  useEffect(() => {
    if (
      loading ||
      !engineReady ||
      syncInProgressRef.current ||
      phase === "game_over" ||
      phase === "reviewing" ||
      lifecycle.result ||
      opponentThinking ||
      pendingPromotion ||
      chessGame.isReviewing()
    ) {
      return;
    }

    if (!isPlayerTurn()) {
      void requestOpponentMove();
    }
  }, [
    chessGame,
    engineReady,
    isPlayerTurn,
    loading,
    moves.length,
    opponentThinking,
    pendingPromotion,
    phase,
    lifecycle.result,
    requestOpponentMove,
  ]);

  const applyMove = useCallback(
    async (from: string, to: string, promotion?: string) => {
      if (phase === "game_over" || opponentThinking || !isPlayerTurn()) {
        return false;
      }

      const legalMoves = chessGame.getLegalMoves(from);
      const needsPromotion = legalMoves.some(
        (move) => move.from === from && move.to === to && move.promotion,
      );

      if (needsPromotion && !promotion) {
        setPendingPromotion({ from, to });
        setPhase("promotion");
        return false;
      }

      const move = chessGame.makeMove(from, to, promotion);
      if (!move) {
        return false;
      }

      const record: GameMove = {
        moveNumber: moves.length + 1,
        san: move.san,
        uci: `${from}${to}${promotion ?? ""}`,
        fen: chessGame.getLiveFen(),
        color: chessTurnToColor(move.color),
      };

      addMove(record);
      exitReview();

      await persistMove(record);

      const finished = await finalizeIfOver();
      if (!finished && !isPlayerTurn()) {
        void requestOpponentMove();
      }

      return true;
    },
    [
      addMove,
      chessGame,
      exitReview,
      finalizeIfOver,
      gameId,
      isPlayerTurn,
      moves.length,
      opponentThinking,
      persistMove,
      phase,
      requestOpponentMove,
      setPendingPromotion,
      setPhase,
    ],
  );

  const handleDrop = useCallback(
    (source: string, target: string) => {
      if (phase === "game_over" || opponentThinking || !isPlayerTurn()) {
        return false;
      }

      const legalMoves = chessGame.getLegalMoves(source);
      const matchingMoves = legalMoves.filter(
        (move) => move.from === source && move.to === target,
      );
      if (matchingMoves.length === 0) {
        return false;
      }

      const needsPromotion = matchingMoves.some((move) => move.promotion);
      void applyMove(source, target);
      return !needsPromotion;
    },
    [applyMove, chessGame, isPlayerTurn, opponentThinking, phase],
  );

  const handlePromotion = useCallback(
    (piece: "q" | "r" | "b" | "n") => {
      if (!pendingPromotion) return;
      void applyMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
      setPhase("playing");
    },
    [applyMove, pendingPromotion, setPendingPromotion, setPhase],
  );

  const handleResign = useCallback(async () => {
    const nextLifecycle = resolveGameResult(playerColor, "resignation");
    setLifecycle(nextLifecycle);
    setPhase("game_over");

    if (persist) {
      try {
        await resignGame(gameId);
      } catch {
        toast.error("Failed to save resignation");
      }
    }
  }, [gameId, persist, playerColor, setLifecycle, setPhase]);

  const getLegalMovesForSquare = useCallback(
    (square: string) => chessGame.getLegalMoves(square),
    [chessGame],
  );

  useEffect(() => {
    return () => {
      setOpponentThinking(false);
    };
  }, [setOpponentThinking]);

  const isPlayersTurn = isPlayerTurn();
  const inCheck = chessGame.isCheck();
  const checkSquare = inCheck ? chessGame.getKingSquare() : null;
  const sideToMove = chessTurnToColor(chessGame.turn());

  const handleClockTimeout = useCallback(
    async (color: PlayerColor) => {
      if (lifecycle.result) return;

      const winner = color === "white" ? "black" : "white";
      const nextLifecycle = resolveGameResult(playerColor, "timeout", winner);
      setLifecycle(nextLifecycle);
      setPhase("game_over");

      if (persist) {
        try {
          await completeGame(gameId, {
            result: nextLifecycle.result!,
            resultReason: "timeout",
            pgn: generatePgn(chessGame, {
              Result:
                nextLifecycle.result === "WHITE_WIN"
                  ? "1-0"
                  : nextLifecycle.result === "BLACK_WIN"
                    ? "0-1"
                    : "1/2-1/2",
            }),
            finalFen: chessGame.getLiveFen(),
          });
        } catch {
          toast.error("Failed to save game result");
        }
      }
    },
    [chessGame, gameId, lifecycle.result, persist, playerColor, setLifecycle, setPhase],
  );

  const clock = useGameClock({
    initialSeconds: timeControlInitial,
    incrementSeconds: timeControlIncrement,
    sideToMove,
    paused:
      reviewIndex !== null ||
      !!lifecycle.result ||
      phase === "game_over" ||
      !!pendingPromotion ||
      loading,
    onTimeout: handleClockTimeout,
  });

  const canDrag =
    !lifecycle.result &&
    !opponentThinking &&
    !pendingPromotion &&
    isPlayersTurn &&
    reviewIndex === null;

  return {
    loading,
    loadedAsCompleted,
    isFinished: !!lifecycle.result,
    engineReady,
    engineError,
    fen: chessGame.getFen(),
    orientation,
    phase,
    lifecycle,
    moves,
    reviewIndex,
    opponentThinking,
    pendingPromotion,
    playerColor,
    stockfishLevel,
    inCheck,
    checkSquare,
    isPlayerInCheck: inCheck && isPlayersTurn,
    isPlayerTurn: isPlayersTurn,
    getLegalMovesForSquare,
    canDrag,
    handleDrop,
    handlePromotion,
    handleResign,
    goToMove,
    exitReview,
    flipBoard: () =>
      setOrientation(orientation === "white" ? "black" : "white"),
    showClocks: clock.enabled,
    whiteClockMs: clock.whiteMs,
    blackClockMs: clock.blackMs,
  };
}
