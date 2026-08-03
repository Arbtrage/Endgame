"use client";

import { Crown, Loader2 } from "lucide-react";
import { formatClock } from "@/features/game/engine/clock";
import { cn } from "@/shared/lib/utils";
import type { PlayerColor } from "@/features/game/types";

type ChessPlayerBarProps = {
  name: string;
  subtitle?: string;
  color: PlayerColor;
  isActive: boolean;
  isYou?: boolean;
  inCheck?: boolean;
  thinking?: boolean;
  thinkingLabel?: string;
  position: "top" | "bottom";
  clockMs?: number | null;
  showClock?: boolean;
};

export function ChessPlayerBar({
  name,
  subtitle,
  color,
  isActive,
  isYou = false,
  inCheck = false,
  thinking = false,
  thinkingLabel = "Thinking…",
  position,
  clockMs = null,
  showClock = false,
}: ChessPlayerBarProps) {
  const clockLow = clockMs !== null && clockMs <= 20_000;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-2 border border-border/70 bg-card px-3 py-2 transition-colors sm:gap-3 sm:px-4 sm:py-2.5",
        position === "top" ? "rounded-t-xl border-b-0" : "rounded-b-xl border-t-0",
        isActive && "border-primary/30 bg-primary/5",
        inCheck && "border-amber-500/40 bg-amber-500/10",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border shadow-sm",
            color === "white"
              ? "border-border/80 bg-zinc-100 text-zinc-900"
              : "border-zinc-700 bg-zinc-900 text-zinc-100",
          )}
          aria-hidden
        >
          <Crown className="size-4 opacity-80" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{name}</p>
            {isYou && name === "You" ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                You
              </span>
            ) : null}
            {inCheck ? (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Check
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {showClock && clockMs !== null ? (
          <span
            className={cn(
              "min-w-[3.25rem] rounded-md border px-2 py-1 text-right font-mono text-sm tabular-nums",
              isActive && "border-primary/30 bg-primary/10",
              clockLow && "border-destructive/40 bg-destructive/10 text-destructive",
            )}
            aria-label="Clock"
          >
            {formatClock(clockMs)}
          </span>
        ) : null}
        {thinking ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            <span className="hidden sm:inline">{thinkingLabel}</span>
          </span>
        ) : isActive ? (
          <span className="relative flex size-2.5" aria-label="To move">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/40 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
        ) : null}
      </div>
    </div>
  );
}
