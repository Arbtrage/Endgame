"use client";

import { Skeleton } from "@/shared/ui/skeleton";
import { BoardSizeContainer } from "@/features/game/components/board-size-container";
import { GamePlayLayout } from "@/features/game/components/game-play-layout";

type GamePlaySkeletonProps = {
  variant?: "standard" | "coach";
};

export function GamePlaySkeleton({ variant = "standard" }: GamePlaySkeletonProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <GamePlayLayout
      variant={variant}
      header={
        <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="hidden h-4 w-40 sm:block" />
        </div>
      }
      board={<ChessPlayAreaSkeleton />}
      sidebar={<GameSidebarSkeleton />}
      extraColumn={variant === "coach" ? <CoachPanelSkeleton /> : undefined}
      />
    </div>
  );
}

function ChessPlayAreaSkeleton() {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl shadow-lg ring-1 ring-border/60">
        <PlayerBarSkeleton position="top" />
        <div className="flex min-h-0 flex-1 border-x border-border/70 bg-muted/30">
          <BoardSizeContainer>
            <Skeleton className="h-full w-full rounded-sm" />
          </BoardSizeContainer>
        </div>
        <PlayerBarSkeleton position="bottom" />
      </div>
    </div>
  );
}

function PlayerBarSkeleton({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      className={
        position === "top"
          ? "flex items-center gap-3 border border-border/70 bg-card px-4 py-2.5 rounded-t-xl border-b-0"
          : "flex items-center gap-3 border border-border/70 bg-card px-4 py-2.5 rounded-b-xl border-t-0"
      }
    >
      <Skeleton className="size-8 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="size-2.5 rounded-full" />
    </div>
  );
}

function GameSidebarSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="shrink-0 space-y-1.5 border-b px-4 py-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-hidden p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
      <div className="flex shrink-0 gap-2 border-t bg-muted/50 p-4">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  );
}

function CoachPanelSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-12" />
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-hidden p-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}
