"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameClock, type ClockState } from "@/features/game/engine/clock";
import type { PlayerColor } from "@/features/game/types";

type UseGameClockOptions = {
  initialSeconds: number | null;
  incrementSeconds: number | null;
  sideToMove: PlayerColor;
  paused: boolean;
  onTimeout: (color: PlayerColor) => void;
};

export function useGameClock({
  initialSeconds,
  incrementSeconds,
  sideToMove,
  paused,
  onTimeout,
}: UseGameClockOptions) {
  const clockRef = useRef<GameClock | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  const previousSideRef = useRef<PlayerColor | null>(null);
  const [clockState, setClockState] = useState<ClockState | null>(null);

  const enabled = initialSeconds !== null && initialSeconds > 0;

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!enabled) {
      clockRef.current?.destroy();
      clockRef.current = null;
      previousSideRef.current = null;
      setClockState(null);
      return;
    }

    const clock = new GameClock({
      initialSeconds: initialSeconds!,
      incrementSeconds: incrementSeconds ?? 0,
    });
    clock.setOnTimeout((color) => onTimeoutRef.current(color));
    clockRef.current = clock;
    previousSideRef.current = null;

    return () => {
      clock.destroy();
      if (clockRef.current === clock) {
        clockRef.current = null;
      }
    };
  }, [enabled, initialSeconds, incrementSeconds]);

  useEffect(() => {
    const clock = clockRef.current;
    if (!clock || !enabled) return;

    if (paused) {
      clock.pause();
      return;
    }

    const state = clock.getState();
    if (!state.activeColor) {
      clock.start(sideToMove);
      previousSideRef.current = sideToMove;
      setClockState(clock.getState());
      return;
    }

    clock.resume();
  }, [enabled, paused, sideToMove]);

  useEffect(() => {
    const clock = clockRef.current;
    if (!clock || !enabled || paused) return;

    if (
      previousSideRef.current &&
      previousSideRef.current !== sideToMove
    ) {
      clock.switchTurn(sideToMove, incrementSeconds ?? 0);
    }

    previousSideRef.current = sideToMove;
    setClockState(clock.getState());
  }, [enabled, incrementSeconds, paused, sideToMove]);

  useEffect(() => {
    if (!enabled) return;

    const id = window.setInterval(() => {
      const clock = clockRef.current;
      if (!clock) return;
      setClockState(clock.getState());
    }, 100);

    return () => window.clearInterval(id);
  }, [enabled]);

  const pauseClock = useCallback(() => {
    clockRef.current?.pause();
  }, []);

  return {
    enabled,
    whiteMs: clockState?.whiteMs ?? null,
    blackMs: clockState?.blackMs ?? null,
    activeColor: clockState?.activeColor ?? null,
    pauseClock,
  };
}
