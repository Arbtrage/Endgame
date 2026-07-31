import gsap from "gsap";
import type { Object3D } from "three";
import { Vector3 } from "three";
import { squareToPosition } from "@/features/marketing/three/board/square-utils";
import { BOARD_SURFACE_Y, type PieceKind } from "@/features/marketing/three/pieces/piece-registry";

const LIFT_HEIGHT = 0.35;
const ARC_HEIGHT = 0.6;

export function animateMove(
  piece: Object3D,
  from: string,
  to: string,
  kind: PieceKind,
  options?: {
    captured?: Object3D;
    onFocus?: (midpoint: Vector3) => void;
    onComplete?: () => void;
  },
): Promise<void> {
  const y = BOARD_SURFACE_Y;
  const start = squareToPosition(from, y);
  const end = squareToPosition(to, y);
  const mid = new Vector3(
    (start.x + end.x) / 2,
    Math.max(start.y, end.y) + ARC_HEIGHT,
    (start.z + end.z) / 2,
  );

  options?.onFocus?.(
    new Vector3((start.x + end.x) / 2, y + 0.5, (start.z + end.z) / 2),
  );

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        options?.onComplete?.();
        resolve();
      },
    });

    const proxy = { t: 0 };

    tl.to(piece.position, {
      y: start.y + LIFT_HEIGHT,
      duration: 0.15,
      ease: "power2.out",
    });

    tl.to(
      proxy,
      {
        t: 1,
        duration: 0.45,
        ease: "power1.inOut",
        onUpdate: () => {
          const t = proxy.t;
          const inv = 1 - t;
          piece.position.x = inv * inv * start.x + 2 * inv * t * mid.x + t * t * end.x;
          piece.position.y =
            inv * inv * (start.y + LIFT_HEIGHT) +
            2 * inv * t * mid.y +
            t * t * end.y;
          piece.position.z = inv * inv * start.z + 2 * inv * t * mid.z + t * t * end.z;
          piece.rotation.z = Math.sin(t * Math.PI) * 0.15;
        },
      },
      "-=0.05",
    );

    tl.to(piece.position, {
      y: end.y,
      duration: 0.2,
      ease: "bounce.out",
    });

    tl.to(piece.rotation, { z: 0, duration: 0.1 }, "-=0.1");

    if (options?.captured) {
      tl.to(
        options.captured.scale,
        { x: 0, y: 0, z: 0, duration: 0.25, ease: "power2.in" },
        "-=0.35",
      );
      tl.to(
        options.captured.position,
        { y: options.captured.position.y - 0.2, duration: 0.25 },
        "-=0.25",
      );
    }
  });
}

export function fadeOutPiece(piece: Object3D): Promise<void> {
  return new Promise((resolve) => {
    gsap.to(piece.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: resolve,
    });
  });
}
