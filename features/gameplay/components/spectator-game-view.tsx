"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GamePlayLayout } from "@/features/game/components/game-play-layout";
import { GamePlaySkeleton } from "@/features/game/components/game-play-skeleton";
import { GameReplayControls } from "@/features/game/components/game-replay-controls";
import { GameResultBanner } from "@/features/game/components/game-result-banner";
import { MoveList } from "@/features/game/components/move-list";
import { BoardSizeContainer } from "@/features/game/components/board-size-container";
import { useReplayKeyboard } from "@/features/game/hooks/use-replay-keyboard";
import { SpectatorHeader } from "@/features/gameplay/components/spectator-header";
import { useSpectatorGame } from "@/features/gameplay/hooks/use-spectator-game";
import type { GameLifecycleState } from "@/features/game/engine/game-lifecycle";
import type { PlayerColor } from "@/features/game/types";
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

type SpectatorGameViewProps = {
  gameId: string;
};

function toLifecycle(
  result: string | null,
  resultReason: string | null,
): GameLifecycleState {
  if (!result) {
    return { phase: "playing", result: null, resultReason: null };
  }
  return {
    phase: "game_over",
    result: result as GameLifecycleState["result"],
    resultReason: resultReason as GameLifecycleState["resultReason"],
  };
}

export function SpectatorGameView({ gameId }: SpectatorGameViewProps) {
  const spectator = useSpectatorGame(gameId);

  useReplayKeyboard({
    moveCount: spectator.moves.length,
    reviewIndex: spectator.reviewIndex,
    onSelectMove: spectator.goToMove,
    onGoLive: spectator.exitReview,
    enabled: !spectator.loading && spectator.moves.length > 0,
  });

  if (spectator.loading) {
    return <GamePlaySkeleton />;
  }

  if (spectator.error || !spectator.game) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-destructive">
          {spectator.error ?? "Game not found"}
        </p>
        <Button render={<Link href="/gameplay" />} nativeButton={false} variant="outline">
          Back to lookup
        </Button>
      </div>
    );
  }

  const { game } = spectator;
  const playerColor = game.playerColor as PlayerColor;
  const lifecycle = toLifecycle(game.result, game.resultReason);
  const showResultBanner = game.status === "COMPLETED" && game.result;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex items-center gap-3">
        <Button
          render={<Link href="/gameplay" />}
          nativeButton={false}
          variant="ghost"
          size="icon-sm"
          aria-label="Back to lookup"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <SpectatorHeader game={game} isLive={spectator.isLive} />
        </div>
      </div>

      <GamePlayLayout
        header={null}
        banner={
          showResultBanner ? (
            <GameResultBanner
              lifecycle={lifecycle}
              playerColor={playerColor}
              moveCount={spectator.moves.length}
            />
          ) : undefined
        }
        board={
          <BoardSizeContainer>
            <GameBoard
              fen={spectator.fen}
              orientation={spectator.orientation}
              canDrag={false}
              checkSquare={spectator.checkSquare}
              onDrop={() => false}
            />
          </BoardSizeContainer>
        }
        sidebar={
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-border/60 bg-card">
            <GameReplayControls
              moveCount={spectator.moves.length}
              activeIndex={spectator.reviewIndex}
              onSelectMove={spectator.goToMove}
              onGoLive={spectator.exitReview}
            />
            <div className="min-h-0 flex-1 overflow-hidden">
              <MoveList
                moves={spectator.moves}
                activeIndex={spectator.reviewIndex}
                onSelectMove={spectator.goToMove}
              />
            </div>
          </div>
        }
      />
    </div>
  );
}
