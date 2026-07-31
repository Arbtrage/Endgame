"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { PIECE_GLB } from "@/features/marketing/three/pieces/piece-registry";

export function usePreloadAssets() {
  useEffect(() => {
    for (const path of Object.values(PIECE_GLB)) {
      useGLTF.preload(path);
    }
  }, []);
}
