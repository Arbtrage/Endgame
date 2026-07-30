"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { getMarvelSuperheroForGame } from "@/features/game/constants/marvel-superheroes";
import { getMarvelVillainForGame } from "@/features/game/constants/marvel-villains";
import {
  formatResultReason,
  getResultLabel,
} from "@/features/game/engine/game-lifecycle";
import type { GameSummary } from "@/shared/api/fetcher";
import type { PlayerColor } from "@/features/game/types";
import { cn } from "@/shared/lib/utils";

type GameCardProps = {
  game: GameSummary;
};

function opponentLabel(game: GameSummary): string {
  if (game.mode === "AI_OPPONENT") {
    return getMarvelSuperheroForGame(game.id);
  }
  return getMarvelVillainForGame(game.id);
}

function modeLabel(mode: GameSummary["mode"]): string {
  switch (mode) {
    case "AI_OPPONENT":
      return "Hero";
    case "COACH":
      return "Coach";
    default:
      return "Villain";
  }
}

export function GameCard({ game }: GameCardProps) {
  const resultLabel = getResultLabel(
    game.result as "WHITE_WIN" | "BLACK_WIN" | "DRAW" | "ABANDONED" | null,
    game.playerColor as PlayerColor,
  );

  return (
    <Link
      href={`/play/${game.id}`}
      className={cn(
        "group flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card px-4 py-3 transition-all",
        "hover:border-primary/40 hover:bg-muted/20 hover:shadow-sm",
      )}
    >
      <div className="min-w-0 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium leading-snug">
            vs {opponentLabel(game)}
          </span>
          <Badge variant="outline" className="shrink-0">
            {modeLabel(game.mode)}
          </Badge>
          <Badge variant="secondary" className="shrink-0">
            {resultLabel}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {game.moveCount} moves · {new Date(game.createdAt).toLocaleDateString()}
          {game.resultReason
            ? ` · ${formatResultReason(game.resultReason as never)}`
            : ""}
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Replay
        <ChevronRight className="size-4" />
      </span>
    </Link>
  );
}
