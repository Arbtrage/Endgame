"use client";

import dynamic from "next/dynamic";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="size-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  ),
});

const SCENE_URL =
  "https://prod.spline.design/I4RWMStIbCiNExE8/scene.splinecode";

export function SplineScene() {
  return (
    <Spline scene={SCENE_URL} className="!h-full !w-full" />
  );
}
