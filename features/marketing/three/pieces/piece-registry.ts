export type PieceKind = "p" | "r" | "n" | "b" | "q" | "k";

export const PIECE_GLB: Record<PieceKind, string> = {
  p: "/assets/chess/gltf/pawn.glb",
  r: "/assets/chess/gltf/rook.glb",
  n: "/assets/chess/gltf/knight.glb",
  b: "/assets/chess/gltf/bishop.glb",
  q: "/assets/chess/gltf/queen.glb",
  k: "/assets/chess/gltf/king.glb",
};

/**
 * Target world-space height per piece (square size = 1).
 * Models are normalized from their measured bounding box at load,
 * because the source GLBs carry inconsistent baked node scales.
 */
export const PIECE_TARGET_HEIGHT: Record<PieceKind, number> = {
  p: 0.8,
  r: 0.95,
  n: 1.0,
  b: 1.15,
  q: 1.35,
  k: 1.5,
};

/** Board square top relative to the pieces group origin. */
export const BOARD_SURFACE_Y = 0.1;
