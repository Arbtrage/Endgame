"use client";

import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { PIECE_COLORS } from "@/features/marketing/three/board/board-materials";
import {
  BOARD_SURFACE_Y,
  PIECE_GLB,
  PIECE_TARGET_HEIGHT,
  type PieceKind,
} from "./piece-registry";
import { squareToPosition } from "@/features/marketing/three/board/square-utils";
import { useLandingSceneStore } from "@/features/marketing/stores/landing-scene-store";

type PieceMeshProps = {
  square: string;
  kind: PieceKind;
  color: "w" | "b";
};

function PieceModel({
  kind,
  color,
}: {
  kind: PieceKind;
  color: "w" | "b";
}) {
  const { scene } = useGLTF(PIECE_GLB[kind]);

  const normalized = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mat = mesh.material;
        if (mat && "clone" in mat && typeof mat.clone === "function") {
          const clonedMat = mat.clone() as MeshStandardMaterial;
          clonedMat.color.copy(
            color === "w" ? PIECE_COLORS.white : PIECE_COLORS.black,
          );
          clonedMat.metalness =
            color === "w"
              ? PIECE_COLORS.whiteMetalness
              : PIECE_COLORS.blackMetalness;
          clonedMat.roughness =
            color === "w"
              ? PIECE_COLORS.whiteRoughness
              : PIECE_COLORS.blackRoughness;
          mesh.material = clonedMat;
        }
      }
    });

    // Normalize: source GLBs carry wildly inconsistent baked node scales,
    // so measure the real bounding box and scale to the target height.
    const box = new Box3().setFromObject(clone);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const scale = PIECE_TARGET_HEIGHT[kind] / (size.y || 1);

    clone.scale.multiplyScalar(scale);
    clone.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    );

    return clone;
  }, [scene, color, kind]);

  return <primitive object={normalized} />;
}

export function PieceMesh({ square, kind, color }: PieceMeshProps) {
  const groupRef = useRef<Group>(null);
  const registerPieceRef = useLandingSceneStore((s) => s.registerPieceRef);
  const unregisterPieceRef = useLandingSceneStore((s) => s.unregisterPieceRef);
  const pos = squareToPosition(square, BOARD_SURFACE_Y);

  useEffect(() => {
    if (groupRef.current) {
      registerPieceRef(square, groupRef.current);
    }
    return () => unregisterPieceRef(square);
  }, [square, registerPieceRef, unregisterPieceRef]);

  return (
    <group ref={groupRef} position={pos.toArray()}>
      <PieceModel kind={kind} color={color} />
    </group>
  );
}

for (const path of Object.values(PIECE_GLB)) {
  useGLTF.preload(path);
}
