"use client";

import dynamic from "next/dynamic";
import { CoachPanel } from "@/features/coaching/components/coach-panel";
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
import { useCoachGame } from "@/features/game/hooks/use-coach-game";
import { useActiveGameReady } from "@/features/game/hooks/use-game-session";
import { useGameOverUi } from "@/features/game/hooks/use-game-over-ui";
import { useMoveSounds } from "@/features/game/hooks/use-move-sounds";
import { usePlayerDisplayName } from "@/features/game/hooks/use-player-display-name";
import { useReplayKeyboard } from "@/features/game/hooks/use-replay-keyboard";
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

type CoachGameViewProps = {
  gameId: string;
};

export function CoachGameView({ gameId }: CoachGameViewProps) {
  const game = useCoachGame({ gameId, persist: true });
  const playerName = usePlayerDisplayName();
  const opponentName = getMarvelVillainForGame(gameId);
  const gameReady = useActiveGameReady(gameId, game.loading);
  const gameOverUi = useGameOverUi({
    isFinished: game.isFinished,
    loadedAsCompleted: game.loadedAsCompleted,
    ready: gameReady,
  });
  useMoveSounds(game.loading ? [] : game.moves);
  useReplayKeyboard({
    moveCount: game.moves.length,
    reviewIndex: game.reviewIndex,
    onSelectMove: game.goToMove,
    onGoLive: game.exitReview,
    enabled: !game.loading && !game.pendingPromotion,
  });

  if (game.loading) {
    return <GamePlaySkeleton variant="coach" />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <GamePlayLayout
        variant="coach"
        header={
          <GameHeader
            playerName={playerName}
            playerColor={game.playerColor}
            stockfishLevel={game.stockfishLevel}
            modeLabel="Coach Mode"
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
            showClocks={game.showClocks}
            whiteClockMs={game.whiteClockMs}
            blackClockMs={game.blackClockMs}
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
          />
        }
        extraColumn={
          <CoachPanel
            explanations={game.explanations}
            loading={game.coachLoading}
            collapsed={game.panelCollapsed}
            onToggleCollapse={() =>
              game.setPanelCollapsed(!game.panelCollapsed)
            }
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
