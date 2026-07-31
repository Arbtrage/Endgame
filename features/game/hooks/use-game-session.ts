"use client";

import { useEffect } from "react";
import { useGameStore } from "@/features/game/stores/game-store";

/** Clear stale Zustand state immediately when navigating to a different game. */
export function useGameSessionReset(gameId: string) {
  useEffect(() => {
    useGameStore.getState().resetLocalGame();
  }, [gameId]);
}

export function useActiveGameReady(gameId: string, loading: boolean) {
  const activeGameId = useGameStore((state) => state.gameId);
  return !loading && activeGameId === gameId;
}
