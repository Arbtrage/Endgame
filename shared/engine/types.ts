export interface SearchOptions {
  depth?: number;
  moveTime?: number;
  skillLevel?: number;
}

export interface EngineMove {
  uci: string;
  eval?: number;
  depth: number;
  nodes?: number;
  pv?: string[];
}

export interface Evaluation {
  cp: number;
  mate?: number;
  depth: number;
  bestMove: string;
}

export interface StockfishEngine {
  ready(): Promise<void>;
  getBestMove(
    fen: string,
    moves: string[],
    options?: SearchOptions,
  ): Promise<EngineMove>;
  evaluate(
    fen: string,
    moves: string[],
    options?: SearchOptions,
  ): Promise<Evaluation>;
  setSkillLevel(level: number): void;
  stop(): void;
  destroy(): void;
}

declare global {
  interface Window {
    Stockfish?: () => Promise<StockfishInstance>;
  }
}

export interface StockfishInstance {
  addMessageListener(listener: (line: string) => void): void;
  removeMessageListener(listener: (line: string) => void): void;
  postMessage(message: string): void;
  terminate(): void;
}
