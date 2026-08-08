"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChartBar, UploadSimple } from "@phosphor-icons/react";
import { PGNImportDialog } from "@/features/analysis/components/pgn-import-dialog";
import { GameCard } from "@/features/game/components/game-card";
import { listGames } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { EmptyState } from "@/shared/components/empty-state";
import {
  FeatureHero,
  FeaturePage,
  FeaturePanel,
  FeatureSection,
} from "@/shared/components/feature-page";
import { Button } from "@/shared/ui/button";
import { GameRowSkeleton } from "@/shared/ui/skeleton";

export function AnalyzeHub() {
  const router = useRouter();
  const { data: games, isLoading } = useQuery({
    queryKey: queryKeys.games.list({ status: "COMPLETED" }),
    queryFn: () => listGames({ status: "COMPLETED", pageSize: 20 }),
  });

  return (
    <FeaturePage>
      <FeatureHero
        icon={ChartBar}
        title="Analyze"
        description="Review completed games with engine-backed classifications, accuracy scores, and AI summaries."
        action={
          <PGNImportDialog
            onImported={(gameId) => router.push(`/analyze/${gameId}`)}
          />
        }
      />

      <FeaturePanel
        footer={
          <p className="text-xs text-muted-foreground">
            Analysis runs with Stockfish, then saves to your account.
          </p>
        }
      >
        <FeatureSection
          title="Completed games"
          description="Select a game to view or run analysis."
        >
          {isLoading ? (
            <div className="space-y-2">
              <GameRowSkeleton />
              <GameRowSkeleton />
              <GameRowSkeleton />
            </div>
          ) : games && games.length > 0 ? (
            <div className="space-y-2">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card/40 p-3 shadow-elevated sm:flex-row sm:items-center sm:justify-between"
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
            <EmptyState
              icon={<UploadSimple className="size-5" weight="light" />}
              title="Nothing to analyze yet"
              description="Finish a game or import a PGN to get accuracy scores and move feedback."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button render={<Link href="/play/coach" />} nativeButton={false}>
                    Play a game
                  </Button>
                  <PGNImportDialog
                    onImported={(gameId) => router.push(`/analyze/${gameId}`)}
                  />
                </div>
              }
            />
          )}
        </FeatureSection>
      </FeaturePanel>
    </FeaturePage>
  );
}
