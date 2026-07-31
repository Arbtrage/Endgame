"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";

type GameSetupProps = {
  onSuccess?: (gameId: string) => void;
};

type PlayModeHubProps = {
  mode: "COMPUTER" | "AI_OPPONENT" | "COACH";
  icon: LucideIcon;
  title: string;
  description: string;
  hint?: string;
  newGameLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  SetupComponent: ComponentType<GameSetupProps>;
};

export function PlayModeHub({
  mode,
  icon,
  title,
  description,
  hint,
  newGameLabel,
  dialogTitle,
  dialogDescription,
  SetupComponent,
}: PlayModeHubProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: games, isLoading } = useQuery({
    queryKey: queryKeys.games.list({ mode }),
    queryFn: () => listGames({ mode, pageSize: 20 }),
  });

  const inProgress = games?.filter((game) => game.status === "IN_PROGRESS") ?? [];
  const completed =
    games?.filter((game) => game.status === "COMPLETED") ?? [];

  const handleCreated = (gameId: string) => {
    setDialogOpen(false);
    router.push(`/play/${gameId}`);
  };

  return (
    <FeaturePage>
      <FeatureHero icon={icon} title={title} description={description} hint={hint} />

      <FeaturePanel
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Continue an in-progress game or start a new match.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              {newGameLabel}
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-8">
            {inProgress.length > 0 ? (
              <FeatureSection
                title="In progress"
                description="Pick up where you left off."
              >
                <div className="space-y-2">
                  {inProgress.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </FeatureSection>
            ) : null}

            <FeatureSection
              title={inProgress.length > 0 ? "Recent games" : "Your games"}
              description={
                inProgress.length > 0
                  ? "Replay or review finished matches."
                  : "Start a new game or replay a recent match."
              }
            >
              {completed.length > 0 ? (
                <div className="space-y-2">
                  {completed.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/60 p-8 text-center">
                  <p className="text-sm font-medium">No games yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start your first match with the button below.
                  </p>
                  <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    {newGameLabel}
                  </Button>
                </div>
              )}
            </FeatureSection>
          </div>
        )}
      </FeaturePanel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[min(90vh,820px)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <SetupComponent onSuccess={handleCreated} />
        </DialogContent>
      </Dialog>
    </FeaturePage>
  );
}
