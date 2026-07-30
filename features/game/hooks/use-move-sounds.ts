"use client";

import { useEffect, useRef } from "react";
import type { GameMove } from "@/features/game/types";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(frequency: number, durationMs: number, volume = 0.07) {
  const ctx = getAudioContext();
  if (!ctx) return;

  void ctx.resume();

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  oscillator.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

  oscillator.start(now);
  oscillator.stop(now + durationMs / 1000);
}

export function playMoveSound(san: string) {
  if (san.includes("#")) {
    playTone(520, 120, 0.09);
    window.setTimeout(() => playTone(680, 140, 0.08), 90);
    return;
  }

  if (san.includes("+")) {
    playTone(440, 90, 0.08);
    return;
  }

  if (san.includes("x")) {
    playTone(220, 70, 0.09);
    return;
  }

  if (san.startsWith("O-O")) {
    playTone(300, 60, 0.06);
    window.setTimeout(() => playTone(360, 60, 0.06), 55);
    return;
  }

  playTone(320, 55, 0.06);
}

export function useMoveSounds(moves: GameMove[]) {
  const previousLengthRef = useRef(0);

  useEffect(() => {
    if (moves.length <= previousLengthRef.current) {
      previousLengthRef.current = moves.length;
      return;
    }

    const latestMove = moves[moves.length - 1];
    if (latestMove) {
      playMoveSound(latestMove.san);
    }

    previousLengthRef.current = moves.length;
  }, [moves]);
}
