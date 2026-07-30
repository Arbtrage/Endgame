"use client";

import dynamic from "next/dynamic";
import { OpponentCommentBubble } from "@/features/coaching/components/opponent-comment";
import { ChessPlayArea } from "@/features/game/components/chess-play-area";
import { GameHeader } from "@/features/game/components/game-header";
import { GameOverDialog } from "@/features/game/components/game-over-dialog";
import { GamePlayLayout } from "@/features/game/components/game-play-layout";
import { GamePlaySkeleton } from "@/features/game/components/game-play-skeleton";
import { GameSidebarPanel } from "@/features/game/components/game-sidebar-panel";
import { PromotionDialog } from "@/features/game/components/promotion-dialog";
import { useAiGame } from "@/features/game/hooks/use-ai-game";
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

type AiGameViewProps = {
  gameId: string;
};

export function AiGameView({ gameId }: AiGameViewProps) {
  const game = useAiGame({ gameId, persist: true });
  const playerName = usePlayerDisplayName();
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
            stockfishLevel={10}
            modeLabel={`AI · ${game.personalityName}`}
            opponentTitle={game.personalityName}
          />
        }
        board={
          <ChessPlayArea
            playerName={playerName}
            playerColor={game.playerColor}
            orientation={game.orientation}
            opponentName={game.personalityName}
            opponentSubtitle="AI opponent"
            playerSubtitle={`Playing ${game.playerColor}`}
            isPlayerTurn={game.isPlayerTurn}
            inCheck={game.inCheck}
            opponentThinking={game.opponentThinking}
            thinkingLabel={`${game.personalityName} is thinking…`}
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
            disabled={game.phase === "game_over"}
            topSlot={
              game.opponentComment ? (
                <OpponentCommentBubble
                  comment={game.opponentComment}
                  personalityName={game.personalityName}
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
        open={game.phase === "game_over"}
        lifecycle={game.lifecycle}
        playerColor={game.playerColor}
        moveCount={game.moves.length}
        gameId={gameId}
      />
    </div>
  );
}
