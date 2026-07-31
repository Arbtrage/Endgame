"use client";

import { useEffect } from "react";
import { useLandingSceneStore } from "@/features/marketing/stores/landing-scene-store";

export function useHeroScroll(heroRef: React.RefObject<HTMLElement | null>) {
  const setScrollProgress = useLandingSceneStore((s) => s.setScrollProgress);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const heroHeight = el.offsetHeight;
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(1, scrolled / heroHeight);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [heroRef, setScrollProgress]);
}

export function useHeroMouseParallax(containerRef: React.RefObject<HTMLElement | null>) {
  const setMouse = useLandingSceneStore((s) => s.setMouse);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      setMouse({ x, y });
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    return () => el.removeEventListener("mousemove", onMove);
  }, [containerRef, setMouse]);
}
