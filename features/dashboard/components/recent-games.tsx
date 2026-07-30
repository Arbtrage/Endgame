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
    return <Skeleton className="h-32 w-full" />;
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No games yet"
        description="Play your first game against a villain to see your history here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {data.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
