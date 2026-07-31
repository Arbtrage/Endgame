"use client";

import { Bloom } from "@react-three/postprocessing";
import { useLandingSceneStore } from "@/features/marketing/stores/landing-scene-store";

export function ConditionalEffects() {
  const gpuTier = useLandingSceneStore((s) => s.gpuTier);

  if (gpuTier === "low") {
    return null;
  }

  return (
    <Bloom
      intensity={0.25}
      luminanceThreshold={0.85}
      luminanceSmoothing={0.4}
      mipmapBlur
    />
  );
}
