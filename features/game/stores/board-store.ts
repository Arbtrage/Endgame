import { create } from "zustand";
import type { BoardTheme } from "@/features/game/types";
import { BOARD_THEMES } from "@/features/game/types";

type BoardStore = {
  theme: BoardTheme;
  orientation: "white" | "black";
  setTheme: (theme: BoardTheme) => void;
  setOrientation: (orientation: "white" | "black") => void;
  flipBoard: () => void;
};

export const useBoardStore = create<BoardStore>((set, get) => ({
  theme: "classic",
  orientation: "white",
  setTheme: (theme) => set({ theme }),
  setOrientation: (orientation) => set({ orientation }),
  flipBoard: () =>
    set({
      orientation: get().orientation === "white" ? "black" : "white",
    }),
}));

export function getBoardStyles(theme: BoardTheme) {
  const config = BOARD_THEMES[theme];
  return {
    darkSquareStyle: { backgroundColor: config.dark },
    lightSquareStyle: { backgroundColor: config.light },
  };
}
