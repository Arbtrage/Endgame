"use client";

import { useQuery } from "@tanstack/react-query";
import { listGames } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { EmptyState } from "@/shared/components/empty-state";
import { GameCard } from "@/features/game/components/game-card";
import { GameRowSkeleton } from "@/shared/ui/skeleton";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

export function RecentGames() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.games.list({ status: "COMPLETED", pageSize: 5 }),
    queryFn: () => listGames({ status: "COMPLETED", pageSize: 5 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <GameRowSkeleton />
        <GameRowSkeleton />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No finished games yet"
        description="Your completed games show up here for replay and analysis."
        action={
          <Button render={<Link href="/play/coach" />} nativeButton={false}>
            Play your first game
          </Button>
        }
      />
    );
  }

  return (
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
      {data.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
