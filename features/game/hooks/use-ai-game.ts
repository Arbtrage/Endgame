"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getPersonality } from "@/features/coaching/types/personalities";
import { getMarvelSuperheroForGame } from "@/features/game/constants/marvel-superheroes";
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
import { requestAiMoveWithFallback } from "@/features/game/engine/ai-move-client";
import { useGameSessionReset } from "@/features/game/hooks/use-game-session";
import { useGameClock } from "@/features/game/hooks/use-game-clock";
import { useMoveSync } from "@/features/game/hooks/use-move-sync";
import { useSession } from "@/shared/auth/auth-client";

type UseAiGameOptions = {
  gameId: string;
  persist?: boolean;
};

export function useAiGame({ gameId, persist = true }: UseAiGameOptions) {
  const { data: session } = useSession();
  const {
    playerColor,
    aiPersonality,
    chessGame,
    phase,
    lifecycle,
    moves,
    reviewIndex,
    opponentThinking,
    pendingPromotion,
    initGame,
    setPhase,
    setLifecycle,
    addMove,
    setOpponentThinking,
    setPendingPromotion,
    goToMove,
    exitReview,
  } = useGameStore();

  const orientation = useBoardStore((state) => state.orientation);
  const setOrientation = useBoardStore((state) => state.setOrientation);
  const [loading, setLoading] = useState(true);
  const [loadedAsCompleted, setLoadedAsCompleted] = useState(false);
  const [timeControlInitial, setTimeControlInitial] = useState<number | null>(
    null,
  );
  const [timeControlIncrement, setTimeControlIncrement] = useState<
    number | null
  >(null);
  const [opponentComment, setOpponentComment] = useState<string | null>(null);
  const processingRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { persistMove, syncInProgressRef } = useMoveSync(gameId, persist);

  const personality = getPersonality(aiPersonality ?? "intermediate");
  const opponentName = getMarvelSuperheroForGame(gameId);

  useGameSessionReset(gameId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadedAsCompleted(false);
      try {
        const game = await getGame(gameId);
        if (cancelled) return;
        initGame({
          gameId,
          gameMode: "AI_OPPONENT",
          playerColor: game.playerColor as PlayerColor,
          stockfishLevel: 5,
          aiPersonality: game.aiPersonality,
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
  }, [gameId, initGame, setLifecycle, setOrientation, setPhase]);

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
  }, [chessGame, gameId, persist, playerColor, session?.user?.id, setLifecycle, setPhase]);

  const requestOpponentMove = useCallback(async () => {
    if (processingRef.current || phase === "game_over") return;
    processingRef.current = true;
    setOpponentThinking(true);
    setOpponentComment(null);

    try {
      const response = await requestAiMoveWithFallback({
        gameId,
        fen: chessGame.getLiveFen(),
        moves: [],
        personality: aiPersonality ?? "intermediate",
        skillLevel: 5,
      });

      const move = chessGame.makeMoveUci(response.uci);
      if (!move) {
        throw new Error("AI returned an illegal move");
      }

      const record: GameMove = {
        moveNumber: moves.length + 1,
        san: move.san,
        uci: response.uci,
        fen: chessGame.getLiveFen(),
        color: chessTurnToColor(move.color),
      };

      addMove(record);
      setOpponentThinking(false);

      if (response.comment) {
        setOpponentComment(response.comment);
      }

      if (persist) {
        await persistMove(record);
      }

      await finalizeIfOver();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "AI opponent failed to move";
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
    aiPersonality,
    chessGame,
    finalizeIfOver,
    gameId,
    moves.length,
    persist,
    persistMove,
    isPlayerTurn,
    lifecycle.result,
    personality,
    setOpponentThinking,
  ]);

  useEffect(() => {
    if (
      loading ||
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- async opponent move on turn change
      void requestOpponentMove();
    }
  }, [
    chessGame,
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
  }, [gameId, persist, playerColor, session?.user?.id, setLifecycle, setPhase]);

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
    [chessGame, gameId, lifecycle.result, persist, playerColor, session?.user?.id, setLifecycle, setPhase],
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
    fen: chessGame.getFen(),
    orientation,
    phase,
    lifecycle,
    moves,
    reviewIndex,
    opponentThinking,
    opponentComment,
    opponentName,
    playingStyle: personality.name,
    pendingPromotion,
    playerColor,
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
      useBoardStore
        .getState()
        .setOrientation(orientation === "white" ? "black" : "white"),
    showClocks: clock.enabled,
    whiteClockMs: clock.whiteMs,
    blackClockMs: clock.blackMs,
  };
}
