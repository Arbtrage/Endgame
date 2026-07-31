"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChessPlayArea } from "@/features/game/components/chess-play-area";
import { GameOverDialog } from "@/features/game/components/game-over-dialog";
import { GamePlayLayout } from "@/features/game/components/game-play-layout";
import { GamePlaySkeleton } from "@/features/game/components/game-play-skeleton";
import { GameResultBanner } from "@/features/game/components/game-result-banner";
import { GameSidebarPanel } from "@/features/game/components/game-sidebar-panel";
import { PromotionDialog } from "@/features/game/components/promotion-dialog";
import { useReplayKeyboard } from "@/features/game/hooks/use-replay-keyboard";
import { useMoveSounds } from "@/features/game/hooks/use-move-sounds";
import { usePlayerDisplayName } from "@/features/game/hooks/use-player-display-name";
import { PvpChatPanel } from "@/features/pvp/components/pvp-chat-panel";
import { PvpDrawOfferBanner } from "@/features/pvp/components/pvp-draw-offer-banner";
import { usePvpGame } from "@/features/pvp/hooks/use-pvp-game";
import { Button } from "@/shared/ui/button";
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

type PvpGameViewProps = {
  gameId: string;
};

export function PvpGameView({ gameId }: PvpGameViewProps) {
  const router = useRouter();
  const game = usePvpGame({ gameId });
  const playerName = usePlayerDisplayName();
  const [rematchSent, setRematchSent] = useState(false);
  const {
    isFinished,
    loadedAsCompleted,
    setShowGameOverDialog,
  } = game;

  useMoveSounds(game.loading ? [] : game.moves);
  useReplayKeyboard({
    moveCount: game.moves.length,
    reviewIndex: game.reviewIndex,
    onSelectMove: game.goToMove,
    onGoLive: game.exitReview,
    enabled: !game.loading && !game.pendingPromotion,
  });

  useEffect(() => {
    if (isFinished && !loadedAsCompleted) {
      setShowGameOverDialog(true);
    }
  }, [isFinished, loadedAsCompleted, setShowGameOverDialog]);

  if (game.loading) {
    return <GamePlaySkeleton />;
  }

  const showClocks = game.clock.enabled;
  const showDrawBanner = !!game.pendingDrawOfferUserId && !game.isFinished;

  const handlePlayAgain = async () => {
    if (game.rematchInviteId) {
      const nextGameId = await game.handleAcceptRematch();
      if (nextGameId) {
        router.push(`/play/${nextGameId}`);
      }
      return;
    }

    const invite = await game.handleRequestRematch();
    if (invite) {
      setRematchSent(true);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <GamePlayLayout
        header={
          <div className="flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-sm font-medium">vs {game.opponentName}</p>
              <p className="text-xs text-muted-foreground">
                {game.isFinished
                  ? "Game over"
                  : game.isPlayerTurn
                    ? "Your turn"
                    : "Opponent's turn"}
              </p>
            </div>
          </div>
        }
        banner={
          game.isFinished ? (
            <GameResultBanner
              lifecycle={game.lifecycle}
              playerColor={game.playerColor}
              moveCount={game.moves.length}
            />
          ) : undefined
        }
        board={
          <ChessPlayArea
            board={
              <GameBoard
                fen={game.fen}
                orientation={game.orientation}
                canDrag={game.canDrag}
                playerColor={game.playerColor}
                checkSquare={game.checkSquare}
                getLegalMovesForSquare={game.getLegalMovesForSquare}
                onDrop={game.handleDrop}
              />
            }
            playerName={playerName}
            playerColor={game.playerColor}
            orientation={game.orientation}
            opponentName={game.opponentName}
            opponentSubtitle="Live opponent"
            playerSubtitle={`Playing ${game.playerColor}`}
            isPlayerTurn={game.isPlayerTurn}
            inCheck={game.inCheck}
            opponentThinking={!game.isPlayerTurn && !game.isFinished}
            thinkingLabel="Waiting for move…"
            showClocks={showClocks}
            whiteClockMs={game.clock.whiteMs}
            blackClockMs={game.clock.blackMs}
          />
        }
        sidebar={
          <GameSidebarPanel
            moves={game.moves}
            activeIndex={game.reviewIndex}
            onSelectMove={game.goToMove}
            onResign={game.handleResign}
            onFlipBoard={game.flipBoard}
            onOfferDraw={game.handleOfferDraw}
            onGoLive={game.exitReview}
            isFinished={game.isFinished}
            drawOfferPending={game.isOwnDrawOffer}
            disabled={!!game.pendingPromotion}
            topSlot={
              showDrawBanner ? (
                <PvpDrawOfferBanner
                  offeredByName={game.drawOfferedByName}
                  opponentName={game.opponentName}
                  isOwnOffer={game.isOwnDrawOffer}
                  onAccept={
                    game.isOwnDrawOffer ? undefined : game.handleAcceptDraw
                  }
                  onDecline={
                    game.isOwnDrawOffer ? undefined : game.handleDeclineDraw
                  }
                />
              ) : null
            }
            bottomSlot={
              <PvpChatPanel
                messages={game.chatMessages}
                currentUserId={game.sessionUserId ?? ""}
                disabled={!!game.pendingPromotion}
                onSend={game.handleSendChat}
              />
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
        open={game.showGameOverDialog}
        onOpenChange={game.setShowGameOverDialog}
        lifecycle={game.lifecycle}
        playerColor={game.playerColor}
        moveCount={game.moves.length}
        gameId={gameId}
        onPlayAgain={handlePlayAgain}
      />
      {game.isFinished && (game.rematchInviteId || rematchSent) ? (
        <div className="pointer-events-none fixed inset-x-3 bottom-3 z-40 flex justify-center sm:inset-x-auto sm:right-4 sm:bottom-4 sm:justify-end">
          <div className="pointer-events-auto w-full max-w-sm rounded-xl border border-border bg-background p-4 shadow-lg">
            {game.rematchInviteId ? (
              <>
                <p className="text-sm font-medium">
                  {game.rematchOfferedByName ?? "Opponent"} wants a rematch
                </p>
                <Button
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => void handlePlayAgain()}
                >
                  Accept rematch
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Rematch invite sent — waiting for {game.opponentName}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
