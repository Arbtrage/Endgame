"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { AiGameView } from "@/features/game/components/ai-game-view";
import { CoachGameView } from "@/features/game/components/coach-game-view";
import { ComputerGameView } from "@/features/game/components/computer-game-view";
import { PvpGameView } from "@/features/pvp/components/pvp-game-view";
import { GamePlaySkeleton } from "@/features/game/components/game-play-skeleton";
import { getGame } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { Button } from "@/shared/ui/button";

type GameModeRouterProps = {
  gameId: string;
};

export function GameModeRouter({ gameId }: GameModeRouterProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.games.detail(gameId),
    queryFn: () => getGame(gameId),
  });

  if (isError) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-border/50 bg-card/40 px-6 py-10 text-center shadow-elevated">
        <p className="text-lg font-semibold">Game not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This game may have been removed or you don&apos;t have access to it.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => void refetch()}>
            <RefreshCw className="mr-2 size-4" />
            Retry
          </Button>
          <Button render={<Link href="/dashboard" />} nativeButton={false}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return <GamePlaySkeleton />;
  }

  if (data.mode === "AI_OPPONENT") {
    return <AiGameView gameId={gameId} />;
  }

  if (data.mode === "COACH") {
    return <CoachGameView gameId={gameId} />;
  }

  if (data.mode === "PVP") {
    return <PvpGameView gameId={gameId} />;
  }

  return <ComputerGameView gameId={gameId} />;
}
