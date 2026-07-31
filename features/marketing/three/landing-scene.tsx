"use client";

import { Suspense } from "react";
import { useLandingSceneStore } from "@/features/marketing/stores/landing-scene-store";
import { AIOrb } from "@/features/marketing/three/ai-orb/ai-orb";
import { ChessBoard3D } from "@/features/marketing/three/board/chess-board-3d";
import { FloatingPlatform } from "@/features/marketing/three/board/floating-platform";
import { CameraRig } from "@/features/marketing/three/camera/camera-rig";
import { SceneBackground } from "@/features/marketing/three/effects/scene-background";
import { SceneLights } from "@/features/marketing/three/lights/scene-lights";
import { ChessPieces } from "@/features/marketing/three/pieces/chess-pieces";
import { PieceAssets } from "@/features/marketing/three/pieces/piece-assets";

export function LandingScene() {
  const fen = useLandingSceneStore((s) => s.fen);
  const highlightedSquare = useLandingSceneStore((s) => s.highlightedSquare);
  const gpuTier = useLandingSceneStore((s) => s.gpuTier);
  const particleCount = gpuTier === "low" ? 20 : 50;

  return (
    <>
      <SceneBackground particleCount={particleCount} />
      <SceneLights />
      <CameraRig />
      <FloatingPlatform />
      <ChessBoard3D highlightedSquare={highlightedSquare} />
      <Suspense fallback={null}>
        <PieceAssets>
          <ChessPieces fen={fen} />
        </PieceAssets>
      </Suspense>
      <AIOrb />
    </>
  );
}
