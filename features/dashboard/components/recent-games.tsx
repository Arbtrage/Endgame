"use client";

import { useQuery } from "@tanstack/react-query";
import { listGames } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { EmptyState } from "@/shared/components/empty-state";
import { GameCard } from "@/features/game/components/game-card";
import { Skeleton } from "@/shared/ui/skeleton";

export function RecentGames() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.games.list({ status: "COMPLETED", pageSize: 5 }),
    queryFn: () => listGames({ status: "COMPLETED", pageSize: 5 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No games yet"
        description="Start a match against a villain or hero — your history will show up here for replay."
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
