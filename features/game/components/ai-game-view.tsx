"use client";

import dynamic from "next/dynamic";
import { OpponentCommentBubble } from "@/features/coaching/components/opponent-comment";
import { ChessPlayArea } from "@/features/game/components/chess-play-area";
import { getHeroThinkingLabel } from "@/features/game/constants/marvel-superheroes";
import { GameHeader } from "@/features/game/components/game-header";
import { GameOverDialog } from "@/features/game/components/game-over-dialog";
import { GameResultBanner } from "@/features/game/components/game-result-banner";
import { GamePlayLayout } from "@/features/game/components/game-play-layout";
import { GamePlaySkeleton } from "@/features/game/components/game-play-skeleton";
import { GameSidebarPanel } from "@/features/game/components/game-sidebar-panel";
import { PromotionDialog } from "@/features/game/components/promotion-dialog";
import { useAiGame } from "@/features/game/hooks/use-ai-game";
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

type AiGameViewProps = {
  gameId: string;
};

export function AiGameView({ gameId }: AiGameViewProps) {
  const game = useAiGame({ gameId, persist: true });
  const playerName = usePlayerDisplayName();
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
    return <GamePlaySkeleton />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <GamePlayLayout
        header={
          <GameHeader
            playerName={playerName}
            playerColor={game.playerColor}
            stockfishLevel={10}
            modeLabel="Hero Match"
            opponentTitle={game.opponentName}
            playingStyle={game.playingStyle}
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
            opponentName={game.opponentName}
            opponentSubtitle={`${game.playingStyle} style`}
            playerSubtitle={`Playing ${game.playerColor}`}
            isPlayerTurn={game.isPlayerTurn}
            inCheck={game.inCheck}
            opponentThinking={game.opponentThinking}
            thinkingLabel={getHeroThinkingLabel(game.opponentName)}
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
            topSlot={
              game.opponentComment ? (
                <OpponentCommentBubble
                  comment={game.opponentComment}
                  speakerName={game.opponentName}
                />
              ) : undefined
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
