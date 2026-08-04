"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChessPlayArea } from "@/features/game/components/chess-play-area";
import { GameHeader } from "@/features/game/components/game-header";
import { GameOverDialog } from "@/features/game/components/game-over-dialog";
import {
  getAnalysisBackgroundHint,
  useBackgroundAnalysisStatus,
} from "@/features/analysis/hooks/use-background-analysis-status";
import { GamePlayLayout } from "@/features/game/components/game-play-layout";
import { GamePlaySkeleton } from "@/features/game/components/game-play-skeleton";
import { GameResultBanner } from "@/features/game/components/game-result-banner";
import { PromotionDialog } from "@/features/game/components/promotion-dialog";
import { useActiveGameReady } from "@/features/game/hooks/use-game-session";
import { useGameOverUi } from "@/features/game/hooks/use-game-over-ui";
import { useReplayKeyboard } from "@/features/game/hooks/use-replay-keyboard";
import { useMoveSounds } from "@/features/game/hooks/use-move-sounds";
import { usePlayerDisplayName } from "@/features/game/hooks/use-player-display-name";
import { PvpChatPanel } from "@/features/pvp/components/pvp-chat-panel";
import { PvpDrawOfferBanner } from "@/features/pvp/components/pvp-draw-offer-banner";
import { usePvpGame } from "@/features/pvp/hooks/use-pvp-game";
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
  const gameReady = useActiveGameReady(gameId, game.loading);
  const gameOverUi = useGameOverUi({
    isFinished: game.isFinished,
    loadedAsCompleted: game.loadedAsCompleted,
    ready: gameReady,
  });
  const bgAnalysisStatus = useBackgroundAnalysisStatus(gameId);

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

  const rematchLabel = game.rematchInviteId
    ? `${game.rematchOfferedByName ?? "Opponent"} wants a rematch`
    : rematchSent
      ? `Rematch invite sent — waiting for ${game.opponentName}`
      : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <GamePlayLayout
        header={
          <GameHeader
            playerName={playerName}
            playerColor={game.playerColor}
            stockfishLevel={0}
            modeLabel="PvP"
            opponentTitle={game.opponentName}
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
        panel={{
          moves: game.moves,
          activeIndex: game.reviewIndex,
          onSelectMove: game.goToMove,
          onResign: game.handleResign,
          onFlipBoard: game.flipBoard,
          onOfferDraw: game.handleOfferDraw,
          onGoLive: game.exitReview,
          isFinished: game.isFinished,
          drawOfferPending: game.isOwnDrawOffer,
          disabled: !!game.pendingPromotion,
          topSlot: showDrawBanner ? (
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
          ) : null,
          bottomSlot: (
            <PvpChatPanel
              messages={game.chatMessages}
              currentUserId={game.sessionUserId ?? ""}
              disabled={!!game.pendingPromotion}
              onSend={game.handleSendChat}
            />
          ),
        }}
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
        onPlayAgain={handlePlayAgain}
        playAgainLabel={
          game.rematchInviteId
            ? "Accept rematch"
            : rematchSent
              ? "Rematch sent"
              : "Request rematch"
        }
        playAgainDisabled={rematchSent && !game.rematchInviteId}
        playAgainHint={rematchLabel}
        analysisHint={getAnalysisBackgroundHint(bgAnalysisStatus)}
      />
    </div>
  );
}
