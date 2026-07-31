"use client";

import { useGLTF } from "@react-three/drei";
import { PIECE_GLB } from "./piece-registry";

/** Eagerly loads all piece GLTFs before rendering children. */
export function PieceAssets({ children }: { children: React.ReactNode }) {
  useGLTF(PIECE_GLB.p);
  useGLTF(PIECE_GLB.r);
  useGLTF(PIECE_GLB.n);
  useGLTF(PIECE_GLB.b);
  useGLTF(PIECE_GLB.q);
  useGLTF(PIECE_GLB.k);
  return <>{children}</>;
}
