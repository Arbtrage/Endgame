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
import { usePvpGameChannel } from "@/features/pvp/hooks/use-pvp-game-channel";
import { useGameSessionReset } from "@/features/game/hooks/use-game-session";
import { useGameClock } from "@/features/game/hooks/use-game-clock";
import { useMoveSync } from "@/features/game/hooks/use-move-sync";
import { useSession } from "@/shared/auth/auth-client";
import {
  acceptDraw,
  acceptPvpInvite,
  completeGame,
  createRematchInvite,
  declineDraw,
  getGame,
  listGameMessages,
  offerDraw,
  resignGame,
  sendGameMessage,
  type GameChatMessage,
} from "@/shared/api/fetcher";

function resolveMyColor(
  userId: string,
  game: {
    whiteUserId?: string | null;
    blackUserId?: string | null;
    playerColor: string;
  },
): PlayerColor {
  if (game.whiteUserId === userId) return "white";
  if (game.blackUserId === userId) return "black";
  return game.playerColor as PlayerColor;
}

export function usePvpGame({ gameId }: { gameId: string }) {
  const { data: session } = useSession();
  const {
    playerColor,
    chessGame,
    phase,
    lifecycle,
    moves,
    reviewIndex,
    pendingPromotion,
    initGame,
    setPhase,
    setLifecycle,
    addMove,
    setPendingPromotion,
    goToMove,
    exitReview,
  } = useGameStore();

  const orientation = useBoardStore((state) => state.orientation);
  const setOrientation = useBoardStore((state) => state.setOrientation);
  const flipBoard = useBoardStore((state) => state.flipBoard);
  const [loading, setLoading] = useState(true);
  const [loadedAsCompleted, setLoadedAsCompleted] = useState(false);
  const [timeControlInitial, setTimeControlInitial] = useState<number | null>(null);
  const [timeControlIncrement, setTimeControlIncrement] = useState<number | null>(null);
  const [whitePlayer, setWhitePlayer] = useState<{ id: string; name: string | null; email: string } | null>(null);
  const [blackPlayer, setBlackPlayer] = useState<{ id: string; name: string | null; email: string } | null>(null);
  const [pendingDrawOfferUserId, setPendingDrawOfferUserId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<GameChatMessage[]>([]);
  const [rematchInviteId, setRematchInviteId] = useState<string | null>(null);
  const [rematchOfferedByName, setRematchOfferedByName] = useState<string | null>(null);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const lastSyncedMoveRef = useRef(0);
  const { persistMove } = useMoveSync(gameId, true);

  useGameSessionReset(gameId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!session?.user?.id) return;
      setLoading(true);
      setLoadedAsCompleted(false);
      try {
        const game = await getGame(gameId);
        if (cancelled) return;

        const myColor = resolveMyColor(session.user.id, game);
        initGame({
          gameId,
          gameMode: "PVP",
          playerColor: myColor,
          stockfishLevel: 0,
          moves: game.moves as GameMove[],
        });
        setTimeControlInitial(game.timeControlInitial);
        setTimeControlIncrement(game.timeControlIncrement);
        setOrientation(myColor);
        setWhitePlayer(
          game.whitePlayer
            ? {
                id: game.whitePlayer.id,
                name: game.whitePlayer.name,
                email: game.whitePlayer.email,
              }
            : null,
        );
        setBlackPlayer(
          game.blackPlayer
            ? {
                id: game.blackPlayer.id,
                name: game.blackPlayer.name,
                email: game.blackPlayer.email,
              }
            : null,
        );
        setPendingDrawOfferUserId(game.pendingDrawOfferUserId ?? null);
        lastSyncedMoveRef.current = game.moves.length;

        try {
          const messages = await listGameMessages(gameId);
          if (!cancelled) setChatMessages(messages);
        } catch {
          // Chat history is optional on load failure
        }

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

    void load();
    return () => {
      cancelled = true;
    };
  }, [gameId, initGame, session?.user?.id, setLifecycle, setOrientation, setPhase]);

  const handleRemoteMove = useCallback(
    (payload: {
      moveNumber: number;
      san: string;
      uci: string;
      fen: string;
      color: string;
    }) => {
      if (payload.moveNumber <= lastSyncedMoveRef.current) return;
      if (reviewIndex !== null) return;

      const applied = chessGame.makeMoveUci(payload.uci);
      if (!applied) return;

      const record: GameMove = {
        moveNumber: payload.moveNumber,
        san: payload.san,
        uci: payload.uci,
        fen: payload.fen,
        color: payload.color as PlayerColor,
      };
      addMove(record);
      lastSyncedMoveRef.current = payload.moveNumber;
    },
    [addMove, chessGame, reviewIndex],
  );

  const handleRemoteGameOver = useCallback(
    (payload: { result: string; resultReason: string }) => {
      setLifecycle({
        phase: "game_over",
        result: payload.result as GameLifecycleState["result"],
        resultReason: payload.resultReason as GameLifecycleState["resultReason"],
      });
      setPhase("game_over");
      setPendingDrawOfferUserId(null);
      setShowGameOverDialog(true);
    },
    [setLifecycle, setPhase],
  );

  const handleRemoteDrawOffered = useCallback(
    (payload: { offeredByUserId: string }) => {
      setPendingDrawOfferUserId(payload.offeredByUserId);
    },
    [],
  );

  const handleRemoteDrawDeclined = useCallback(() => {
    setPendingDrawOfferUserId(null);
  }, []);

  const handleRemoteChatMessage = useCallback((payload: GameChatMessage) => {
    setChatMessages((current) => {
      if (current.some((message) => message.id === payload.id)) return current;
      return [...current, payload];
    });
  }, []);

  const handleRemoteRematchOffered = useCallback(
    (payload: { inviteId: string; offeredByName: string | null }) => {
      setRematchInviteId(payload.inviteId);
      setRematchOfferedByName(payload.offeredByName);
      setShowGameOverDialog(true);
    },
    [],
  );

  usePvpGameChannel({
    gameId,
    enabled: !loading,
    onMoveMade: handleRemoteMove,
    onGameOver: handleRemoteGameOver,
    onDrawOffered: handleRemoteDrawOffered,
    onDrawDeclined: handleRemoteDrawDeclined,
    onChatMessage: handleRemoteChatMessage,
    onRematchOffered: handleRemoteRematchOffered,
  });

  const isPlayerTurn = useCallback(() => {
    return chessGame.turn() === colorToChessTurn(playerColor);
  }, [chessGame, playerColor]);

  const finalizeIfOver = useCallback(async () => {
    if (!chessGame.isGameOver()) return false;

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
    setShowGameOverDialog(true);

    if (nextLifecycle.result) {
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
  }, [chessGame, gameId, playerColor, setLifecycle, setPhase]);

  const applyMove = useCallback(
    async (from: string, to: string, promotion?: string) => {
      if (phase === "game_over" || !isPlayerTurn()) return false;

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
      if (!move) return false;

      const record: GameMove = {
        moveNumber: moves.length + 1,
        san: move.san,
        uci: `${from}${to}${promotion ?? ""}`,
        fen: chessGame.getLiveFen(),
        color: chessTurnToColor(move.color),
      };

      addMove(record);
      exitReview();
      lastSyncedMoveRef.current = record.moveNumber;

      await persistMove(record);
      await finalizeIfOver();
      return true;
    },
    [
      addMove,
      chessGame,
      exitReview,
      finalizeIfOver,
      isPlayerTurn,
      moves.length,
      persistMove,
      phase,
      setPendingPromotion,
      setPhase,
    ],
  );

  const handleDrop = useCallback(
    (source: string, target: string) => {
      if (phase === "game_over" || !isPlayerTurn()) return false;

      const legalMoves = chessGame.getLegalMoves(source);
      const matchingMoves = legalMoves.filter(
        (move) => move.from === source && move.to === target,
      );
      if (matchingMoves.length === 0) return false;

      const needsPromotion = matchingMoves.some((move) => move.promotion);
      void applyMove(source, target);
      return !needsPromotion;
    },
    [applyMove, chessGame, isPlayerTurn, phase],
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
    setShowGameOverDialog(true);
    try {
      await resignGame(gameId);
    } catch {
      toast.error("Failed to save resignation");
    }
  }, [gameId, playerColor, setLifecycle, setPhase]);

  const handleOfferDraw = useCallback(async () => {
    const userId = session?.user?.id;
    if (!userId) return;
    try {
      await offerDraw(gameId);
      setPendingDrawOfferUserId(userId);
      toast.success("Draw offer sent");
    } catch {
      toast.error("Failed to offer draw");
    }
  }, [gameId, session]);

  const handleAcceptDraw = useCallback(async () => {
    const nextLifecycle = resolveGameResult(playerColor, "agreement");
    setLifecycle(nextLifecycle);
    setPhase("game_over");
    setPendingDrawOfferUserId(null);
    setShowGameOverDialog(true);
    try {
      await acceptDraw(gameId);
    } catch {
      toast.error("Failed to accept draw");
    }
  }, [gameId, playerColor, setLifecycle, setPhase]);

  const handleDeclineDraw = useCallback(async () => {
    try {
      await declineDraw(gameId);
      setPendingDrawOfferUserId(null);
    } catch {
      toast.error("Failed to decline draw");
    }
  }, [gameId]);

  const handleSendChat = useCallback(
    async (content: string) => {
      try {
        const message = await sendGameMessage(gameId, content);
        setChatMessages((current) => {
          if (current.some((item) => item.id === message.id)) return current;
          return [...current, message];
        });
      } catch {
        toast.error("Failed to send message");
      }
    },
    [gameId],
  );

  const handleRequestRematch = useCallback(async () => {
    try {
      const invite = await createRematchInvite(gameId);
      toast.success("Rematch invite sent");
      return invite;
    } catch {
      toast.error("Failed to send rematch invite");
      return null;
    }
  }, [gameId]);

  const handleAcceptRematch = useCallback(async () => {
    if (!rematchInviteId) return null;
    try {
      const result = await acceptPvpInvite(rematchInviteId);
      setRematchInviteId(null);
      setRematchOfferedByName(null);
      return result.game.id;
    } catch {
      toast.error("Failed to accept rematch");
      return null;
    }
  }, [rematchInviteId]);

  const getLegalMovesForSquare = useCallback(
    (square: string) => chessGame.getLegalMoves(square),
    [chessGame],
  );

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
      setShowGameOverDialog(true);
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
    },
    [chessGame, gameId, lifecycle.result, playerColor, setLifecycle, setPhase],
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
    !pendingPromotion &&
    isPlayersTurn &&
    reviewIndex === null;

  const opponentName =
    playerColor === "white"
      ? (blackPlayer?.name ?? blackPlayer?.email ?? "Opponent")
      : (whitePlayer?.name ?? whitePlayer?.email ?? "Opponent");

  const drawOfferedByName = (() => {
    if (!pendingDrawOfferUserId) return opponentName;
    if (whitePlayer?.id === pendingDrawOfferUserId) {
      return whitePlayer.name ?? whitePlayer.email;
    }
    if (blackPlayer?.id === pendingDrawOfferUserId) {
      return blackPlayer.name ?? blackPlayer.email;
    }
    return opponentName;
  })();

  const isOwnDrawOffer =
    !!session?.user?.id && pendingDrawOfferUserId === session.user.id;

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
    pendingPromotion,
    playerColor,
    whitePlayer,
    blackPlayer,
    opponentName,
    inCheck,
    checkSquare,
    isPlayerTurn: isPlayersTurn,
    getLegalMovesForSquare,
    canDrag,
    handleDrop,
    handlePromotion,
    handleResign,
    handleOfferDraw,
    handleAcceptDraw,
    handleDeclineDraw,
    handleSendChat,
    handleRequestRematch,
    handleAcceptRematch,
    chatMessages,
    pendingDrawOfferUserId,
    drawOfferedByName,
    isOwnDrawOffer,
    rematchInviteId,
    rematchOfferedByName,
    showGameOverDialog,
    setShowGameOverDialog,
    goToMove,
    exitReview,
    flipBoard,
    clock,
    sessionUserId: session?.user?.id ?? null,
  };
}
