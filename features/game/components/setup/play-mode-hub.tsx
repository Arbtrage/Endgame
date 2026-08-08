"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Shield, Skull } from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { useState } from "react";
import { AiGameSetup } from "@/features/coaching/components/ai-game-setup";
import { CoachGameSetup } from "@/features/coaching/components/coach-game-setup";
import { GameCard } from "@/features/game/components/game-card";
import { GameSetup } from "@/features/game/components/game-setup";
import {
  COACH_SIDEBAR,
  VILLAIN_SIDEBAR,
  HERO_CALLOUT,
} from "@/features/game/components/setup/setup-hints";
import { listGames } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { BezelCard } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";
import { iconClass } from "@/shared/components/icon";
import { PillButton } from "@/shared/components/pill-cta";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { GameRowSkeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type GameSetupProps = {
  onSuccess?: (gameId: string) => void;
};

type PlayMode = "COMPUTER" | "AI_OPPONENT" | "COACH";

type PlayModeConfig = {
  icon: PhosphorIcon;
  title: string;
  description: string;
  dialogTitle: string;
  dialogDescription: string;
  tips: readonly string[];
  SetupComponent: ComponentType<GameSetupProps>;
};

const PLAY_MODE_CONFIG: Record<PlayMode, PlayModeConfig> = {
  COMPUTER: {
    icon: Skull,
    title: "Vs Villain",
    description: "Engine-backed Marvel nemesis · adjustable threat level",
    dialogTitle: "Start vs Villain",
    dialogDescription: "Pick your color, threat level, and optional clock.",
    tips: VILLAIN_SIDEBAR.tips,
    SetupComponent: GameSetup,
  },
  AI_OPPONENT: {
    icon: Shield,
    title: "Vs Hero",
    description: "Superhero opponent · AI personality · optional banter",
    dialogTitle: "Start vs Hero",
    dialogDescription: "Choose your side, clock, and playing style.",
    tips: [
      HERO_CALLOUT.body,
      "Playing style sets difficulty — the hero name is random each game.",
      "Finished games replay from your dashboard.",
    ],
    SetupComponent: AiGameSetup,
  },
  COACH: {
    icon: GraduationCap,
    title: "Coach Mode",
    description: "Villain opponent · live explanations at key moments",
    dialogTitle: "Start coached game",
    dialogDescription: "Configure color, villain strength, and optional clock.",
    tips: COACH_SIDEBAR.tips,
    SetupComponent: CoachGameSetup,
  },
};

const MAX_VISIBLE_GAMES = 4;

type PlayModeHubProps = {
  mode: PlayMode;
};

export function PlayModeHub({ mode }: PlayModeHubProps) {
  const {
    icon: Icon,
    title,
    description,
    dialogTitle,
    dialogDescription,
    tips,
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
  const visibleGames = [...inProgress, ...completed].slice(0, MAX_VISIBLE_GAMES);
  const hiddenCount =
    inProgress.length + completed.length - visibleGames.length;

  const handleCreated = (gameId: string) => {
    setDialogOpen(false);
    router.push(`/play/${gameId}`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 md:gap-5">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <Eyebrow>Play</Eyebrow>
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/25">
              <Icon className={iconClass("md")} weight="light" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
        <PillButton
          showArrow
          className="shrink-0"
          onClick={() => setDialogOpen(true)}
        >
          Start game
        </PillButton>
      </header>

      <BezelCard
        padding="none"
        className="min-h-0 flex-1"
        innerClassName="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]"
      >
        <aside className="hidden shrink-0 border-b border-white/10 p-5 md:block md:border-b-0 md:border-r">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Quick tips
          </p>
          <ul className="mt-4 space-y-3">
            {tips.map((tip) => (
              <li
                key={tip}
                className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex min-h-0 flex-col p-4 md:p-5">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
            <p className="font-display text-sm font-semibold">
              {inProgress.length > 0 ? "Continue or replay" : "Your games"}
            </p>
            {hiddenCount > 0 ? (
              <span className="text-xs text-muted-foreground">
                +{hiddenCount} more on dashboard
              </span>
            ) : null}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <GameRowSkeleton />
              <GameRowSkeleton />
            </div>
          ) : visibleGames.length > 0 ? (
            <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
              {visibleGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
              <p className="text-sm font-medium">No games yet</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Start your first match — settings are saved for next time.
              </p>
              <PillButton
                variant="ghost"
                className="mt-4"
                onClick={() => setDialogOpen(true)}
              >
                Start game
              </PillButton>
            </div>
          )}
        </div>
      </BezelCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={cn(
            "max-h-[min(92dvh,680px)] max-w-[calc(100%-2rem)] gap-0 border-0 bg-transparent p-0 shadow-none",
            "sm:max-w-md",
          )}
        >
          <BezelCard
            padding="lg"
            className="glass-surface max-h-[min(92dvh,680px)]"
            innerClassName="flex max-h-[inherit] flex-col overflow-y-auto"
          >
            <DialogHeader className="shrink-0 text-left">
              <Eyebrow>New match</Eyebrow>
              <DialogTitle className="font-display text-xl tracking-tight">
                {dialogTitle}
              </DialogTitle>
              <DialogDescription>{dialogDescription}</DialogDescription>
            </DialogHeader>
            <div className="mt-5 shrink-0">
              <SetupComponent onSuccess={handleCreated} />
            </div>
          </BezelCard>
        </DialogContent>
      </Dialog>
    </div>
  );
}
