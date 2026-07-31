import { create } from "zustand";
import type { Object3D } from "three";
import type { MoveAnimation, ScenePhase } from "@/features/marketing/engine/types";

type MouseState = { x: number; y: number };

type LandingSceneStore = {
  fen: string;
  phase: ScenePhase;
  activeAnimation: MoveAnimation | null;
  scrollProgress: number;
  mouse: MouseState;
  gpuTier: "low" | "high";
  highlightedSquare: string | null;
  sceneReady: boolean;
  pieceRefs: Map<string, Object3D>;
  setFen: (fen: string) => void;
  setPhase: (phase: ScenePhase) => void;
  setActiveAnimation: (animation: MoveAnimation | null) => void;
  setScrollProgress: (progress: number) => void;
  setMouse: (mouse: MouseState) => void;
  setGpuTier: (tier: "low" | "high") => void;
  setHighlightedSquare: (square: string | null) => void;
  setSceneReady: (ready: boolean) => void;
  registerPieceRef: (square: string, ref: Object3D) => void;
  unregisterPieceRef: (square: string) => void;
  getPieceRef: (square: string) => Object3D | undefined;
  movePieceRef: (from: string, to: string) => void;
};

export const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const useLandingSceneStore = create<LandingSceneStore>((set, get) => ({
  fen: STARTING_FEN,
  phase: "idle",
  activeAnimation: null,
  scrollProgress: 0,
  mouse: { x: 0, y: 0 },
  gpuTier: "high",
  highlightedSquare: null,
  sceneReady: false,
  pieceRefs: new Map(),

  setFen: (fen) => set({ fen }),
  setPhase: (phase) => set({ phase }),
  setActiveAnimation: (activeAnimation) => set({ activeAnimation }),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setMouse: (mouse) => set({ mouse }),
  setGpuTier: (gpuTier) => set({ gpuTier }),
  setHighlightedSquare: (highlightedSquare) => set({ highlightedSquare }),
  setSceneReady: (sceneReady) => set({ sceneReady }),

  registerPieceRef: (square, ref) => {
    const next = new Map(get().pieceRefs);
    next.set(square, ref);
    set({ pieceRefs: next });
  },

  unregisterPieceRef: (square) => {
    const next = new Map(get().pieceRefs);
    next.delete(square);
    set({ pieceRefs: next });
  },

  getPieceRef: (square) => get().pieceRefs.get(square),

  movePieceRef: (from, to) => {
    const next = new Map(get().pieceRefs);
    const ref = next.get(from);
    if (ref) {
      next.delete(from);
      next.set(to, ref);
      set({ pieceRefs: next });
    }
  },
}));
