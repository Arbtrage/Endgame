"use client";

import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

type GameReplayControlsProps = {
  moveCount: number;
  activeIndex: number | null;
  onSelectMove: (index: number) => void;
  onGoLive: () => void;
};

export function GameReplayControls({
  moveCount,
  activeIndex,
  onSelectMove,
  onGoLive,
}: GameReplayControlsProps) {
  if (moveCount === 0) return null;

  const currentIndex = activeIndex ?? moveCount - 1;
  const atStart = currentIndex <= 0;
  const atEnd = currentIndex >= moveCount - 1;

  return (
    <div className="overflow-x-auto border-b border-border/60 px-2 py-2 sm:px-3">
      <div className="flex min-w-max items-center justify-center gap-0.5 sm:gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 sm:size-9"
        aria-label="First move"
        disabled={atStart}
        onClick={() => onSelectMove(0)}
      >
        <ChevronFirst className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 sm:size-9"
        aria-label="Previous move"
        disabled={atStart}
        onClick={() => onSelectMove(Math.max(0, currentIndex - 1))}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-16 px-2 text-center text-xs tabular-nums text-muted-foreground">
        {currentIndex + 1} / {moveCount}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 sm:size-9"
        aria-label="Next move"
        disabled={atEnd}
        onClick={() => onSelectMove(Math.min(moveCount - 1, currentIndex + 1))}
      >
        <ChevronRight className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 sm:size-9"
        aria-label="Last move"
        disabled={atEnd}
        onClick={() => onSelectMove(moveCount - 1)}
      >
        <ChevronLast className="size-4" />
      </Button>
      {!atEnd || activeIndex !== null ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-1 min-h-11 shrink-0 sm:ml-2 sm:min-h-0"
          onClick={onGoLive}
        >
          Live
        </Button>
      ) : null}
      </div>
    </div>
  );
}
