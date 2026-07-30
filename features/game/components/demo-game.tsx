"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChessGame } from "@/features/game/engine/chess-game";
import { chessTurnToColor, colorToChessTurn } from "@/features/game/types";
import type { GameMove } from "@/features/game/types";
import { getBoardStyles, useBoardStore } from "@/features/game/stores/board-store";
import { getStockfishEngine } from "@/shared/engine/stockfish-engine";
import { Skeleton } from "@/shared/ui/skeleton";
import { OpponentThinking } from "@/features/game/components/opponent-thinking";
import { PromotionDialog } from "@/features/game/components/promotion-dialog";

const GameBoard = dynamic(
  () =>
    import("@/features/game/components/game-board").then(
      (module) => module.GameBoard,
    ),
  { ssr: false, loading: () => <Skeleton className="aspect-square w-full" /> },
);

export function DemoGame() {
  const theme = useBoardStore((state) => state.theme);
  const [chessGame] = useState(() => new ChessGame());
  const [fen, setFen] = useState(() => chessGame.getFen());
  const [moves, setMoves] = useState<GameMove[]>([]);
  const [thinking, setThinking] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);

  useEffect(() => {
    getBoardStyles(theme);
    getStockfishEngine()
      .ready()
      .then(() => getStockfishEngine().setSkillLevel(3))
      .catch((error: Error) => setEngineError(error.message));
  }, [theme]);

  async function requestEngineMove(game: ChessGame, currentMoves: GameMove[]) {
    setThinking(true);
    try {
      const best = await getStockfishEngine().getBestMove(
        game.getLiveFen(),
        game.getHistoryUci(),
        { skillLevel: 3, depth: 10 },
      );
      const move = game.makeMoveUci(best.uci);
      if (move) {
        const record: GameMove = {
          moveNumber: currentMoves.length + 1,
          san: move.san,
          uci: best.uci,
          fen: game.getLiveFen(),
          color: chessTurnToColor(move.color),
        };
        setMoves((prev) => [...prev, record]);
        setFen(game.getFen());
        setThinking(false);
      }
    } catch (error) {
      setEngineError(
        error instanceof Error ? error.message : "Engine unavailable",
      );
    } finally {
      setThinking(false);
    }
  }

  async function applyMove(from: string, to: string, promotion?: string) {
    const game = chessGame;
    if (game.turn() !== colorToChessTurn("white")) {
      return false;
    }

    const legalMoves = game.getLegalMoves(from);
    const needsPromotion = legalMoves.some(
      (move) => move.from === from && move.to === to && move.promotion,
    );

    if (needsPromotion && !promotion) {
      setPendingPromotion({ from, to });
      return false;
    }

    const move = game.makeMove(from, to, promotion);
    if (!move) return false;

    const record: GameMove = {
      moveNumber: moves.length + 1,
      san: move.san,
      uci: `${from}${to}${promotion ?? ""}`,
      fen: game.getLiveFen(),
      color: "white",
    };

    const nextMoves = [...moves, record];
    setMoves(nextMoves);
    setFen(game.getFen());

    if (!game.isGameOver()) {
      await requestEngineMove(game, nextMoves);
    }

    return true;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Try a demo game</h1>
        <p className="text-muted-foreground">
          Play as white against a random Marvel villain. Sign up to save your
          games.
        </p>
      </div>

      {engineError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {engineError}
        </div>
      ) : null}

      <GameBoard
        fen={fen}
        orientation="white"
        canDrag={!thinking && !pendingPromotion}
        playerColor="white"
        getLegalMovesForSquare={(square) => chessGame.getLegalMoves(square)}
        onDrop={(source, target) => {
          const legalMoves = chessGame.getLegalMoves(source);
          const isLegal = legalMoves.some(
            (move) => move.from === source && move.to === target,
          );
          if (!isLegal) return false;
          void applyMove(source, target);
          return true;
        }}
      />

      {thinking ? <OpponentThinking /> : null}

      <PromotionDialog
        open={!!pendingPromotion}
        color="white"
        onSelect={(piece) => {
          if (pendingPromotion) {
            void applyMove(pendingPromotion.from, pendingPromotion.to, piece);
            setPendingPromotion(null);
          }
        }}
        onClose={() => setPendingPromotion(null)}
      />

      <div className="flex justify-center">
        <Link
          href="/auth/sign-up"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground"
        >
          Sign up to save progress
        </Link>
      </div>
    </div>
  );
}
