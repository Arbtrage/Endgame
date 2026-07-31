export interface ChessEngine {
  getMove(fen: string): Promise<string>;
}

export type ScenePhase = "idle" | "thinking" | "animating";

export type MoveAnimation = {
  from: string;
  to: string;
  uci: string;
  captured?: string;
  promotion?: string;
};
