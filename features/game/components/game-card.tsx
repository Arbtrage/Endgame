"use client";

import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { getMarvelVillainForGame } from "@/features/game/constants/marvel-villains";
import {
  formatResultReason,
  getResultLabel,
} from "@/features/game/engine/game-lifecycle";
import type { GameSummary } from "@/shared/api/fetcher";
import type { PlayerColor } from "@/features/game/types";

type GameCardProps = {
  game: GameSummary;
};

function opponentLabel(game: GameSummary): string {
  if (game.mode === "AI_OPPONENT") {
    return game.aiPersonality ?? "AI opponent";
  }
  return getMarvelVillainForGame(game.id);
}

export function GameCard({ game }: GameCardProps) {
  const resultLabel = getResultLabel(
    game.result as "WHITE_WIN" | "BLACK_WIN" | "DRAW" | "ABANDONED" | null,
    game.playerColor as PlayerColor,
  );

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">vs {opponentLabel(game)}</span>
            <Badge variant="outline">{resultLabel}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {game.moveCount} moves ·{" "}
            {new Date(game.createdAt).toLocaleDateString()}
            {game.resultReason
              ? ` · ${formatResultReason(game.resultReason as never)}`
              : ""}
          </p>
        </div>
        <Link
          href={`/play/${game.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View
        </Link>
      </CardContent>
    </Card>
  );
}
