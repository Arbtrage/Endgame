"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "@/shared/hooks/use-reduced-motion";

const LandingScene = dynamic(
  () => import("./landing-scene").then((mod) => mod.LandingScene),
  { ssr: false },
);

function SceneFallback() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.12),transparent_55%)]" />
  );
}

export function LandingHero3D() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <SceneFallback />;
  }

  return (
    <div className="absolute inset-0">
      <Suspense fallback={<SceneFallback />}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          frameloop="demand"
          className="h-full w-full"
        >
          <LandingScene />
        </Canvas>
      </Suspense>
    </div>
  );
}
