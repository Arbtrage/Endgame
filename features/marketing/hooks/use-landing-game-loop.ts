"use client";

import { useEffect } from "react";
import { Chess } from "chess.js";
import { ChessGame } from "@/features/game/engine/chess-game";
import { MockEngine } from "@/features/marketing/engine/mock-engine";
import type { ChessEngine } from "@/features/marketing/engine/types";
import { useLandingSceneStore } from "@/features/marketing/stores/landing-scene-store";
import { animateMove } from "@/features/marketing/three/animation/move-animator";
import { parseFenPieces } from "@/features/marketing/three/board/square-utils";
import {
  focusCameraOn,
  resetCameraFocus,
} from "@/features/marketing/three/camera/camera-rig";
import type { PieceKind } from "@/features/marketing/three/pieces/piece-registry";

function getMoveDetails(fen: string, uci: string) {
  const chess = new Chess(fen);
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci[4] : undefined;
  const moves = chess.moves({ verbose: true });
  const move = moves.find(
    (m) =>
      m.from === from &&
      m.to === to &&
      (m.promotion ?? "") === (promotion ?? ""),
  );
  return {
    from,
    to,
    promotion,
    capturedSquare: move?.captured ? to : undefined,
  };
}

function getPieceKindAt(fen: string, square: string): PieceKind {
  const pieces = fen.split(" ")[0] ?? "";
  let rank = 7;
  let file = 0;
  for (const char of pieces) {
    if (char === "/") {
      rank--;
      file = 0;
      continue;
    }
    if (char >= "1" && char <= "8") {
      file += parseInt(char, 10);
      continue;
    }
    const sq = `${String.fromCharCode("a".charCodeAt(0) + file)}${rank + 1}`;
    if (sq === square) {
      return char.toLowerCase() as PieceKind;
    }
    file++;
  }
  return "p";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPieceRefs(expected: number, maxMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const count = useLandingSceneStore.getState().pieceRefs.size;
    if (count >= expected) return true;
    await wait(100);
  }
  return false;
}

export function useLandingGameLoop(engine: ChessEngine = new MockEngine()) {
  const setFen = useLandingSceneStore((s) => s.setFen);
  const setPhase = useLandingSceneStore((s) => s.setPhase);
  const setSceneReady = useLandingSceneStore((s) => s.setSceneReady);
  const setHighlightedSquare = useLandingSceneStore(
    (s) => s.setHighlightedSquare,
  );
  const getPieceRef = useLandingSceneStore((s) => s.getPieceRef);

  useEffect(() => {
    const game = new ChessGame();
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function tick() {
      if (cancelled) return;

      const fen = game.getFen();
      const expectedPieces = parseFenPieces(fen).length;
      await waitForPieceRefs(expectedPieces);
      if (cancelled) return;

      setSceneReady(true);

      if (game.isGameOver()) {
        game.reset();
        setFen(game.getFen());
        timeoutId = setTimeout(tick, 4000);
        return;
      }

      setPhase("thinking");

      try {
        const uci = await engine.getMove(fen);
        if (cancelled) return;

        const { from, to, capturedSquare } = getMoveDetails(fen, uci);
        await waitForPieceRefs(expectedPieces);
        const pieceRef = getPieceRef(from);
        const capturedRef = capturedSquare
          ? getPieceRef(capturedSquare)
          : undefined;
        const kind = getPieceKindAt(fen, from);

        setPhase("animating");
        setHighlightedSquare(to);

        if (pieceRef) {
          await animateMove(pieceRef, from, to, kind, {
            captured: capturedRef,
            onFocus: focusCameraOn,
          });
        } else {
          await wait(500);
        }

        game.makeMoveUci(uci);
        setFen(game.getFen());
        resetCameraFocus();
        setHighlightedSquare(null);
        setPhase("idle");

        if (!cancelled) {
          timeoutId = setTimeout(tick, 2500 + Math.random() * 1500);
        }
      } catch {
        if (!cancelled) {
          timeoutId = setTimeout(tick, 3000);
        }
      }
    }

    timeoutId = setTimeout(tick, 3500);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    engine,
    setFen,
    setPhase,
    setSceneReady,
    setHighlightedSquare,
    getPieceRef,
  ]);
}
