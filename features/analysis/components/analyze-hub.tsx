"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { PGNImportDialog } from "@/features/analysis/components/pgn-import-dialog";
import { GameCard } from "@/features/game/components/game-card";
import { listGames } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import {
  FeatureHero,
  FeaturePage,
  FeaturePanel,
  FeatureSection,
} from "@/shared/components/feature-page";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export function AnalyzeHub() {
  const router = useRouter();
  const { data: games, isLoading } = useQuery({
    queryKey: queryKeys.games.list({ status: "COMPLETED" }),
    queryFn: () => listGames({ status: "COMPLETED", pageSize: 20 }),
  });

  return (
    <FeaturePage>
      <FeatureHero
        icon={BarChart3}
        title="Analyze"
        description="Review completed games with engine-backed move classifications, accuracy scores, and AI summaries."
        hint="Import a PGN to analyze games from outside Endgame."
      />

      <FeaturePanel
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Analysis runs in your browser using Stockfish, then saves to your account.
            </p>
            <PGNImportDialog
              onImported={(gameId) => router.push(`/analyze/${gameId}`)}
            />
          </div>
        }
      >
        <FeatureSection
          title="Completed games"
          description="Select a game to view or run analysis."
        >
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : games && games.length > 0 ? (
            <div className="space-y-2">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 [&_a]:pointer-events-none">
                    <GameCard game={game} />
                  </div>
                  <Button
                    render={<Link href={`/analyze/${game.id}`} />}
                    nativeButton={false}
                    size="sm"
                    className="shrink-0 self-end sm:self-center"
                  >
                    Analyze
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/60 p-8 text-center">
              <p className="text-sm font-medium">No completed games yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Finish a game or import a PGN to start analyzing.
              </p>
            </div>
          )}
        </FeatureSection>
      </FeaturePanel>
    </FeaturePage>
  );
}
