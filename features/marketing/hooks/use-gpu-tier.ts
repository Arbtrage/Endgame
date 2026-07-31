"use client";

import { useEffect } from "react";
import { useLandingSceneStore } from "@/features/marketing/stores/landing-scene-store";

export function useGpuTier() {
  const setGpuTier = useLandingSceneStore((s) => s.setGpuTier);

  useEffect(() => {
    const isMobile =
      /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    const lowMemory =
      "deviceMemory" in navigator &&
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 4;
    const lowCores = navigator.hardwareConcurrency <= 4;

    if (isMobile || lowMemory || lowCores) {
      setGpuTier("low");
    } else {
      setGpuTier("high");
    }
  }, [setGpuTier]);
}
