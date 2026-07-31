"use client";

import dynamic from "next/dynamic";
import { ChessPlayArea } from "@/features/game/components/chess-play-area";
import { GameHeader } from "@/features/game/components/game-header";
import { GameOverDialog } from "@/features/game/components/game-over-dialog";
import { GameResultBanner } from "@/features/game/components/game-result-banner";
import { GamePlayLayout } from "@/features/game/components/game-play-layout";
import { GamePlaySkeleton } from "@/features/game/components/game-play-skeleton";
import { GameSidebarPanel } from "@/features/game/components/game-sidebar-panel";
import { PromotionDialog } from "@/features/game/components/promotion-dialog";
import {
  getMarvelVillainForGame,
  getVillainThinkingLabel,
} from "@/features/game/constants/marvel-villains";
import { useComputerGame } from "@/features/game/hooks/use-computer-game";
import { useActiveGameReady } from "@/features/game/hooks/use-game-session";
import { useGameOverUi } from "@/features/game/hooks/use-game-over-ui";
import { useMoveSounds } from "@/features/game/hooks/use-move-sounds";
import { usePlayerDisplayName } from "@/features/game/hooks/use-player-display-name";
import { Skeleton } from "@/shared/ui/skeleton";

const GameBoard = dynamic(
  () =>
    import("@/features/game/components/game-board").then(
      (module) => module.GameBoard,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-sm" />,
  },
);

type ComputerGameViewProps = {
  gameId: string;
};

export function ComputerGameView({ gameId }: ComputerGameViewProps) {
  const game = useComputerGame({ gameId, persist: true });
  const playerName = usePlayerDisplayName();
  const opponentName = getMarvelVillainForGame(gameId);
  const gameReady = useActiveGameReady(gameId, game.loading);
  const gameOverUi = useGameOverUi({
    isFinished: game.isFinished,
    loadedAsCompleted: game.loadedAsCompleted,
    ready: gameReady,
  });
  useMoveSounds(game.loading ? [] : game.moves);

  if (game.loading) {
    return <GamePlaySkeleton />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <GamePlayLayout
        header={
          <GameHeader
            playerName={playerName}
            playerColor={game.playerColor}
            stockfishLevel={game.stockfishLevel}
            opponentTitle={opponentName}
          />
        }
        banner={
          gameOverUi.showResultBanner ? (
            <GameResultBanner
              lifecycle={game.lifecycle}
              playerColor={game.playerColor}
              moveCount={game.moves.length}
              onShowSummary={gameOverUi.showDialog}
            />
          ) : game.engineError && !game.engineReady ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Chess engine failed to load: {game.engineError}
            </div>
          ) : undefined
        }
        board={
          <ChessPlayArea
            playerName={playerName}
            playerColor={game.playerColor}
            orientation={game.orientation}
            opponentName={opponentName}
            opponentSubtitle={`Threat level ${game.stockfishLevel}/20`}
            playerSubtitle={`Playing ${game.playerColor}`}
            isPlayerTurn={game.isPlayerTurn}
            inCheck={game.inCheck}
            opponentThinking={game.opponentThinking}
            thinkingLabel={getVillainThinkingLabel(opponentName)}
            engineLoading={
              !game.engineReady &&
              game.phase === "playing" &&
              !game.isPlayerTurn
            }
            board={
              <GameBoard
                fen={game.fen}
                orientation={game.orientation}
                canDrag={game.canDrag}
                playerColor={game.playerColor}
                boardKey={gameId}
                checkSquare={game.checkSquare}
                getLegalMovesForSquare={game.getLegalMovesForSquare}
                onDrop={game.handleDrop}
              />
            }
          />
        }
        sidebar={
          <GameSidebarPanel
            moves={game.moves}
            activeIndex={game.reviewIndex}
            onSelectMove={game.goToMove}
            onResign={game.handleResign}
            onFlipBoard={game.flipBoard}
            onGoLive={game.exitReview}
            isFinished={game.isFinished}
            disabled={false}
          />
        }
      />

      <PromotionDialog
        open={!!game.pendingPromotion}
        color={game.playerColor}
        onSelect={game.handlePromotion}
        onClose={() => undefined}
      />

      <GameOverDialog
        open={gameOverUi.dialogOpen}
        onOpenChange={(open) => {
          if (!open) gameOverUi.dismissDialog();
        }}
        lifecycle={game.lifecycle}
        playerColor={game.playerColor}
        moveCount={game.moves.length}
        gameId={gameId}
      />
    </div>
  );
}
