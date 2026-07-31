"use client";

import { useMemo } from "react";
import { useLandingGameLoop } from "@/features/marketing/hooks/use-landing-game-loop";
import { useGpuTier } from "@/features/marketing/hooks/use-gpu-tier";
import { usePreloadAssets } from "@/features/marketing/hooks/use-preload-assets";
import { MockEngine } from "@/features/marketing/engine/mock-engine";

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const engine = useMemo(() => new MockEngine(), []);
  useGpuTier();
  usePreloadAssets();
  useLandingGameLoop(engine);
  return <>{children}</>;
}
