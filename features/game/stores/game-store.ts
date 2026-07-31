import { create } from "zustand";
import { ChessGame } from "@/features/game/engine/chess-game";
import type { GameLifecycleState } from "@/features/game/engine/game-lifecycle";
import { createInitialLifecycleState } from "@/features/game/engine/game-lifecycle";
import type { GameMove, GamePhase, PlayerColor } from "@/features/game/types";

type PendingPromotion = {
  from: string;
  to: string;
};

type GameStore = {
  gameId: string | null;
  gameMode: "COMPUTER" | "AI_OPPONENT" | "COACH" | "PVP" | null;
  playerColor: PlayerColor;
  stockfishLevel: number;
  aiPersonality: string | null;
  chessGame: ChessGame;
  phase: GamePhase;
  lifecycle: GameLifecycleState;
  moves: GameMove[];
  reviewIndex: number | null;
  opponentThinking: boolean;
  engineError: string | null;
  pendingPromotion: PendingPromotion | null;
  initGame: (config: {
    gameId: string;
    gameMode?: "COMPUTER" | "AI_OPPONENT" | "COACH" | "PVP";
    playerColor: PlayerColor;
    stockfishLevel: number;
    aiPersonality?: string | null;
    moves?: GameMove[];
  }) => void;
  resetLocalGame: () => void;
  setPhase: (phase: GamePhase) => void;
  setLifecycle: (lifecycle: GameLifecycleState) => void;
  addMove: (move: GameMove) => void;
  setMoves: (moves: GameMove[]) => void;
  setOpponentThinking: (value: boolean) => void;
  setEngineError: (error: string | null) => void;
  setPendingPromotion: (promotion: PendingPromotion | null) => void;
  goToMove: (index: number) => void;
  exitReview: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameId: null,
  gameMode: null,
  playerColor: "white",
  stockfishLevel: 5,
  aiPersonality: null,
  chessGame: new ChessGame(),
  phase: "playing",
  lifecycle: createInitialLifecycleState(),
  moves: [],
  reviewIndex: null,
  opponentThinking: false,
  engineError: null,
  pendingPromotion: null,

  initGame: ({
    gameId,
    gameMode = "COMPUTER",
    playerColor,
    stockfishLevel,
    aiPersonality = null,
    moves = [],
  }) => {
    const chessGame = new ChessGame();
    moves.forEach((move) => {
      chessGame.makeMoveUci(move.uci);
    });

    set({
      gameId,
      gameMode,
      playerColor,
      stockfishLevel,
      aiPersonality,
      chessGame,
      phase: "playing",
      lifecycle: createInitialLifecycleState(),
      moves,
      reviewIndex: null,
      opponentThinking: false,
      engineError: null,
      pendingPromotion: null,
    });
  },

  resetLocalGame: () => {
    set({
      gameId: null,
      gameMode: null,
      aiPersonality: null,
      chessGame: new ChessGame(),
      phase: "playing",
      lifecycle: createInitialLifecycleState(),
      moves: [],
      reviewIndex: null,
      opponentThinking: false,
      engineError: null,
      pendingPromotion: null,
    });
  },

  setPhase: (phase) => set({ phase }),
  setLifecycle: (lifecycle) => set({ lifecycle }),
  addMove: (move) =>
    set((state) => ({
      moves: [...state.moves, move],
      reviewIndex: null,
    })),
  setMoves: (moves) => set({ moves }),
  setOpponentThinking: (opponentThinking) => set({ opponentThinking }),
  setEngineError: (engineError) => set({ engineError }),
  setPendingPromotion: (pendingPromotion) => set({ pendingPromotion }),

  goToMove: (index) => {
    const { chessGame } = get();
    chessGame.goToMove(index);
    set({
      reviewIndex: index,
      phase: index < chessGame.getSnapshotCount() - 1 ? "reviewing" : "playing",
    });
  },

  exitReview: () => {
    const { chessGame } = get();
    chessGame.exitReview();
    set({ reviewIndex: null, phase: "playing" });
  },
}));
