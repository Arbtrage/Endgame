"use client";

import { Badge } from "@/shared/ui/badge";

type GameHeaderProps = {
  playerName: string;
  playerColor: "white" | "black";
  stockfishLevel: number;
  modeLabel?: string;
  opponentTitle: string;
  playingStyle?: string;
};

export function GameHeader({
  playerName,
  playerColor,
  stockfishLevel,
  modeLabel = "Computer",
  opponentTitle,
  playingStyle,
}: GameHeaderProps) {
  const meta = playingStyle
    ? `${playerColor} · ${playingStyle} style`
    : modeLabel.includes("AI") || modeLabel === "Hero Match"
      ? `Playing as ${playerColor}`
      : `${playerColor} · Level ${stockfishLevel}/20`;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
      <div className="flex min-w-0 items-center gap-2">
        <h1 className="truncate text-lg font-semibold tracking-tight">
          {playerName} vs {opponentTitle}
        </h1>
        <Badge variant="secondary" className="shrink-0">
          {modeLabel}
        </Badge>
      </div>
      <p className="hidden shrink-0 text-xs text-muted-foreground sm:block">
        {meta}
      </p>
    </div>
  );
}
