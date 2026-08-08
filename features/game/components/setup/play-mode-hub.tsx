"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Plus, Shield, Skull } from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { useState } from "react";
import { AiGameSetup } from "@/features/coaching/components/ai-game-setup";
import { CoachGameSetup } from "@/features/coaching/components/coach-game-setup";
import { GameCard } from "@/features/game/components/game-card";
import { GameSetup } from "@/features/game/components/game-setup";
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
import { EmptyState } from "@/shared/components/empty-state";
import { GameRowSkeleton } from "@/shared/ui/skeleton";

type GameSetupProps = {
  onSuccess?: (gameId: string) => void;
};

type PlayMode = "COMPUTER" | "AI_OPPONENT" | "COACH";

type PlayModeConfig = {
  icon: PhosphorIcon;
  title: string;
  description: string;
  newGameLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  SetupComponent: ComponentType<GameSetupProps>;
};

const PLAY_MODE_CONFIG: Record<PlayMode, PlayModeConfig> = {
  COMPUTER: {
    icon: Skull,
    title: "Play vs Villain",
    description: "Random Marvel nemesis · engine-backed · your threat level",
    newGameLabel: "New game",
    dialogTitle: "Start vs Villain",
    dialogDescription:
      "Pick your color, threat level, and optional time control.",
    SetupComponent: GameSetup,
  },
  AI_OPPONENT: {
    icon: Shield,
    title: "Play vs Hero",
    description: "Random superhero · AI personality · optional banter",
    newGameLabel: "New game",
    dialogTitle: "Start vs Hero",
    dialogDescription:
      "Choose your side, time control, and hero playing style.",
    SetupComponent: AiGameSetup,
  },
  COACH: {
    icon: GraduationCap,
    title: "Coach Mode",
    description: "Villain opponent · live explanations at key moments",
    newGameLabel: "New game",
    dialogTitle: "Start coached game",
    dialogDescription:
      "Configure your color, villain strength, and optional clock.",
    SetupComponent: CoachGameSetup,
  },
};

type PlayModeHubProps = {
  mode: PlayMode;
  hint?: string;
};

export function PlayModeHub({ mode, hint }: PlayModeHubProps) {
  const {
    icon,
    title,
    description,
    newGameLabel,
    dialogTitle,
    dialogDescription,
    SetupComponent,
  } = PLAY_MODE_CONFIG[mode];
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
          <div className="space-y-2">
            <GameRowSkeleton />
            <GameRowSkeleton />
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
                <EmptyState
                  title="No games in this mode yet"
                  description="Start your first match — settings are saved for next time."
                  action={
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="mr-2 size-4" />
                      {newGameLabel}
                    </Button>
                  }
                />
              )}
            </FeatureSection>
          </div>
        )}
      </FeaturePanel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[min(90vh,820px)] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-4 pt-3">
            <SetupComponent onSuccess={handleCreated} />
          </div>
        </DialogContent>
      </Dialog>
    </FeaturePage>
  );
}
