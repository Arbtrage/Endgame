"use client";

import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { Badge } from "@/shared/ui/badge";
import { getMarvelSuperheroForGame } from "@/features/game/constants/marvel-superheroes";
import { getMarvelVillainForGame } from "@/features/game/constants/marvel-villains";
import {
  formatResultReason,
  getResultLabel,
} from "@/features/game/engine/game-lifecycle";
import type { GameSummary } from "@/shared/api/fetcher";
import type { PlayerColor } from "@/features/game/types";
import { iconClass } from "@/shared/components/icon";
import { cn } from "@/shared/lib/utils";

type GameCardProps = {
  game: GameSummary;
};

function opponentLabel(game: GameSummary): string {
  if (game.mode === "PVP") return "Friend";
  if (game.mode === "AI_OPPONENT") {
    return getMarvelSuperheroForGame(game.id);
  }
  return getMarvelVillainForGame(game.id);
}

function modeLabel(mode: GameSummary["mode"]): string {
  switch (mode) {
    case "PVP":
      return "PvP";
    case "AI_OPPONENT":
      return "Hero";
    case "COACH":
      return "Coach";
    default:
      return "Villain";
  }
}

function resultChipClass(
  inProgress: boolean,
  result: GameSummary["result"],
): string {
  if (inProgress) return "bg-primary/15 text-primary";
  if (result === "WHITE_WIN" || result === "BLACK_WIN") {
    return "bg-[color-mix(in_oklch,var(--move-good)_15%,transparent)] text-[var(--move-good)]";
  }
  if (result === "DRAW") return "bg-white/10 text-muted-foreground";
  return "bg-[color-mix(in_oklch,var(--move-mistake)_15%,transparent)] text-[var(--move-mistake)]";
}

export function GameCard({ game }: GameCardProps) {
  const inProgress = game.status === "IN_PROGRESS";
  const resultLabel = inProgress
    ? "In progress"
    : getResultLabel(
        game.result as "WHITE_WIN" | "BLACK_WIN" | "DRAW" | "ABANDONED" | null,
        game.playerColor as PlayerColor,
      );

  return (
    <Link
      href={`/play/${game.id}`}
      className={cn(
        "group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-spring",
        "hover:border-white/20 hover:bg-white/[0.06]",
      )}
    >
      <div className="min-w-0 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium leading-snug">
            vs {opponentLabel(game)}
          </span>
          <Badge variant="outline" className="shrink-0 border-white/10">
            {modeLabel(game.mode)}
          </Badge>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
              resultChipClass(inProgress, game.result),
            )}
          >
            {resultLabel}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {game.moveCount} moves · {new Date(game.createdAt).toLocaleDateString()}
          {!inProgress && game.resultReason
            ? ` · ${formatResultReason(game.resultReason as never)}`
            : ""}
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
        {inProgress ? "Continue" : "Replay"}
        <CaretRight className={iconClass("sm")} weight="light" />
      </span>
    </Link>
  );
}
