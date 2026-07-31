"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "@/shared/hooks/use-reduced-motion";
import { SceneProvider } from "@/features/marketing/three/scene-provider";
import { cn } from "@/shared/lib/utils";

const LandingScene = dynamic(
  () =>
    import("@/features/marketing/three/landing-scene").then(
      (mod) => mod.LandingScene,
    ),
  { ssr: false },
);

function SceneFallback() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.12),transparent_65%)]" />
  );
}

export function LandingHeroCanvas() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (reducedMotion) {
    return <SceneFallback />;
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 transition-opacity duration-1000",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <Suspense fallback={<SceneFallback />}>
        <Canvas
          camera={{ position: [0, 8, 14], fov: 40, near: 0.1, far: 100 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          shadows="percentage"
          className="h-full w-full"
        >
          <SceneProvider>
            <LandingScene />
          </SceneProvider>
        </Canvas>
      </Suspense>
    </div>
  );
}
