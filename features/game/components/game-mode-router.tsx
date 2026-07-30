"use client";

import { useEffect, useState } from "react";
import { AiGameView } from "@/features/game/components/ai-game-view";
import { CoachGameView } from "@/features/game/components/coach-game-view";
import { ComputerGameView } from "@/features/game/components/computer-game-view";
import { GamePlaySkeleton } from "@/features/game/components/game-play-skeleton";
import { getGame } from "@/shared/api/fetcher";

type GameModeRouterProps = {
  gameId: string;
};

export function GameModeRouter({ gameId }: GameModeRouterProps) {
  const [mode, setMode] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getGame(gameId)
      .then((game) => {
        if (!cancelled) setMode(game.mode);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  if (error) {
    return (
      <p className="text-sm text-destructive">Unable to load game.</p>
    );
  }

  if (!mode) {
    return <GamePlaySkeleton />;
  }

  if (mode === "AI_OPPONENT") {
    return <AiGameView gameId={gameId} />;
  }

  if (mode === "COACH") {
    return <CoachGameView gameId={gameId} />;
  }

  return <ComputerGameView gameId={gameId} />;
}
