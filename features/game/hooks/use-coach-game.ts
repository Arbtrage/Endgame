"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CoachExplanation } from "@/features/coaching/types";
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
  buildEvalContext,
  createKeyMomentDetectorState,
  detectKeyMoments,
} from "@/shared/engine/key-moments";
import {
  completeGame,
  explainMoment,
  getGame,
  getSettings,
  resignGame,
} from "@/shared/api/fetcher";
import { getStockfishEngine } from "@/shared/engine/stockfish-engine";
import { useMoveSync } from "@/features/game/hooks/use-move-sync";

type UseCoachGameOptions = {
  gameId: string;
  persist?: boolean;
};

export function useCoachGame({ gameId, persist = true }: UseCoachGameOptions) {
  const {
    playerColor,
    stockfishLevel,
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
    setEngineError,
    setPendingPromotion,
    goToMove,
    exitReview,
  } = useGameStore();

  const orientation = useBoardStore((state) => state.orientation);
  const setOrientation = useBoardStore((state) => state.setOrientation);
  const [loading, setLoading] = useState(true);
  const [engineReady, setEngineReady] = useState(false);
  const [coachAutoExplain, setCoachAutoExplain] = useState(true);
  const [explanations, setExplanations] = useState<CoachExplanation[]>([]);
  const [coachLoading, setCoachLoading] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const processingRef = useRef(false);
  const momentStateRef = useRef(createKeyMomentDetectorState());
  const prevEvalRef = useRef(0);
  const { persistMove, syncInProgressRef } = useMoveSync(gameId, persist);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [game, settings] = await Promise.all([
          getGame(gameId),
          getSettings().catch(() => null),
        ]);
        if (cancelled) return;
        initGame({
          gameId,
          gameMode: "COACH",
          playerColor: game.playerColor as PlayerColor,
          stockfishLevel: game.stockfishLevel ?? 5,
          moves: game.moves as GameMove[],
        });
        setOrientation(game.playerColor as "white" | "black");
        setCoachAutoExplain(settings?.coachAutoExplain ?? true);
        if (game.status === "COMPLETED") {
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
    };
  }, [gameId, initGame, setLifecycle, setOrientation, setPhase]);

  useEffect(() => {
    let cancelled = false;
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
      });

    return () => {
      cancelled = true;
    };
  }, [setEngineError, stockfishLevel]);

  const isPlayerTurn = useCallback(() => {
    return chessGame.turn() === colorToChessTurn(playerColor);
  }, [chessGame, playerColor]);

  const checkKeyMoment = useCallback(
    async (record: GameMove, fenBefore: string) => {
      if (!coachAutoExplain) return;

      try {
        const engine = getStockfishEngine();
        const evalBefore = prevEvalRef.current;
        const evalResult = await engine.evaluate(
          chessGame.getLiveFen(),
          chessGame.getHistoryUci(),
          { depth: 12 },
        );
        const evalAfter = evalResult.cp;
        prevEvalRef.current = evalAfter;

        const bestMoveResult = await engine.getBestMove(fenBefore, [], {
          depth: 12,
        });
        const isBestMove = record.uci.startsWith(bestMoveResult.uci.slice(0, 4));

        const ctx = buildEvalContext({
          moveNumber: record.moveNumber,
          evalBefore,
          evalAfter,
          isBestMove,
          isCheck: chessGame.isCheck(),
          capturedPiece: record.san.includes("x") ? record.san : null,
          fenBefore,
          fenAfter: record.fen,
          playerColor,
        });

        const moment = detectKeyMoments(ctx, momentStateRef.current);
        if (!moment) return;

        setCoachLoading(true);
        try {
          const result = await explainMoment({
            gameId,
            fen: record.fen,
            moves: chessGame.getHistory(),
            moveNumber: record.moveNumber,
            san: record.san,
            momentType: moment.type,
            evalBefore,
            evalAfter,
            bestMove: bestMoveResult.uci,
          });

          setExplanations((prev) => [
            ...prev,
            {
              id: `${record.moveNumber}-${moment.type}`,
              momentType: moment.type,
              moveNumber: record.moveNumber,
              san: record.san,
              explanation: result.explanation,
              concepts: result.concepts,
              suggestedFollowUp: result.suggestedFollowUp,
              evalBefore,
              evalAfter,
            },
          ]);
        } catch {
          toast.error("Coach unavailable — keep playing!");
        } finally {
          setCoachLoading(false);
        }
      } catch {
        // Evaluation failed silently; game continues
      }
    },
    [chessGame, coachAutoExplain, gameId, playerColor],
  );

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
      const engine = getStockfishEngine();
      engine.setSkillLevel(stockfishLevel);
      const best = await engine.getBestMove(
        chessGame.getLiveFen(),
        chessGame.getHistoryUci(),
        { skillLevel: stockfishLevel },
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
    phase,
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

      const fenBefore = chessGame.getLiveFen();
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

      void checkKeyMoment(record, fenBefore);

      const finished = await finalizeIfOver();
      if (!finished && !isPlayerTurn()) {
        void requestOpponentMove();
      }

      return true;
    },
    [
      addMove,
      checkKeyMoment,
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

  const canDrag =
    phase !== "game_over" &&
    !opponentThinking &&
    !pendingPromotion &&
    isPlayersTurn &&
    reviewIndex === null;

  return {
    loading,
    engineReady,
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
    explanations,
    coachLoading,
    panelCollapsed,
    setPanelCollapsed,
    canDrag,
    handleDrop,
    handlePromotion,
    handleResign,
    goToMove,
    flipBoard: () =>
      useBoardStore
        .getState()
        .setOrientation(orientation === "white" ? "black" : "white"),
  };
}
