import type { EngineMove, SearchOptions, StockfishEngine, StockfishInstance, Evaluation } from "./types";

const DEFAULT_DEPTH = 15;
const DEFAULT_MOVE_TIME = 3000;

function loadStockfishScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Stockfish can only run in the browser"));
  }

  if (window.Stockfish) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-stockfish="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Stockfish script")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "/engine/stockfish.js";
    script.async = true;
    script.dataset.stockfish = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Stockfish script"));
    document.head.appendChild(script);
  });
}

function parseBestMoveLine(line: string): EngineMove | null {
  const match = line.match(/^bestmove\s+(\S+)/);
  if (!match || match[1] === "(none)") {
    return null;
  }

  return {
    uci: match[1],
    depth: 0,
  };
}

function parseInfoLine(line: string): Partial<EngineMove> {
  const parts = line.split(/\s+/);
  const info: Partial<EngineMove> = {};

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === "depth") {
      info.depth = Number(parts[i + 1]);
    }
    if (parts[i] === "score" && parts[i + 1] === "cp") {
      info.eval = Number(parts[i + 2]);
    }
    if (parts[i] === "nodes") {
      info.nodes = Number(parts[i + 1]);
    }
    if (parts[i] === "pv") {
      info.pv = parts.slice(i + 1);
      break;
    }
  }

  return info;
}

class StockfishEngineImpl implements StockfishEngine {
  private instance: StockfishInstance | null = null;
  private readyPromise: Promise<void> | null = null;
  private skillLevel = 5;
  private pendingSearch: {
    resolve: (move: EngineMove) => void;
    reject: (error: Error) => void;
    latestInfo: Partial<EngineMove>;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null = null;
  private listener: ((line: string) => void) | null = null;

  async ready(): Promise<void> {
    if (this.readyPromise) {
      return this.readyPromise;
    }

    this.readyPromise = this.initialize();
    return this.readyPromise;
  }

  private async initialize(): Promise<void> {
    await loadStockfishScript();

    if (!window.Stockfish) {
      throw new Error("Stockfish global not available");
    }

    this.instance = await window.Stockfish();
    this.listener = (line: string) => this.handleMessage(line);
    this.instance.addMessageListener(this.listener);

    await this.sendAndWait("uci", (line) => line === "uciok");
    await this.sendAndWait("isready", (line) => line === "readyok");
    this.applySkillLevel();
  }

  private handleMessage(line: string): void {
    if (!this.pendingSearch) {
      return;
    }

    if (line.startsWith("info ")) {
      this.pendingSearch.latestInfo = {
        ...this.pendingSearch.latestInfo,
        ...parseInfoLine(line),
      };
      return;
    }

    if (line.startsWith("bestmove ")) {
      const move = parseBestMoveLine(line);
      if (!move) {
        this.finishSearch(new Error("Stockfish returned no move"));
        return;
      }

      this.finishSearch(null, {
        ...this.pendingSearch.latestInfo,
        ...move,
        depth: this.pendingSearch.latestInfo.depth ?? move.depth,
      });
    }
  }

  private finishSearch(error: Error | null, move?: EngineMove): void {
    if (!this.pendingSearch) {
      return;
    }

    clearTimeout(this.pendingSearch.timeoutId);
    const { resolve, reject } = this.pendingSearch;
    this.pendingSearch = null;

    if (error) {
      reject(error);
      return;
    }

    if (!move) {
      reject(new Error("No move received from Stockfish"));
      return;
    }

    resolve(move);
  }

  private sendAndWait(
    command: string,
    predicate: (line: string) => boolean,
    timeoutMs = 10000,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.instance) {
        reject(new Error("Stockfish not initialized"));
        return;
      }

      const timeoutId = setTimeout(() => {
        this.instance?.removeMessageListener(listener);
        reject(new Error(`Stockfish command timed out: ${command}`));
      }, timeoutMs);

      const listener = (line: string) => {
        if (predicate(line)) {
          clearTimeout(timeoutId);
          this.instance?.removeMessageListener(listener);
          resolve();
        }
      };

      this.instance.addMessageListener(listener);
      this.instance.postMessage(command);
    });
  }

  private applySkillLevel(): void {
    this.instance?.postMessage(`setoption name Skill Level value ${this.skillLevel}`);
    this.instance?.postMessage("setoption name Threads value 1");
    this.instance?.postMessage("setoption name Hash value 128");
  }

  setSkillLevel(level: number): void {
    this.skillLevel = Math.max(0, Math.min(20, level));
    if (this.instance) {
      this.applySkillLevel();
    }
  }

  async getBestMove(
    fen: string,
    moves: string[],
    options: SearchOptions = {},
  ): Promise<EngineMove> {
    const result = await this.search(fen, moves, options);
    return result;
  }

  async evaluate(
    fen: string,
    moves: string[],
    options: SearchOptions = {},
  ): Promise<Evaluation> {
    const depth = options.depth ?? 12;
    const result = await this.search(fen, moves, {
      ...options,
      depth,
      moveTime: options.moveTime ?? 2000,
    });

    return {
      cp: result.eval ?? 0,
      depth: result.depth,
      bestMove: result.uci,
    };
  }

  private async search(
    fen: string,
    moves: string[],
    options: SearchOptions = {},
  ): Promise<EngineMove> {
    await this.ready();

    if (!this.instance) {
      throw new Error("Stockfish not initialized");
    }

    if (this.pendingSearch) {
      this.stop();
    }

    const depth =
      options.depth ??
      (typeof SharedArrayBuffer === "undefined" ? DEFAULT_DEPTH - 3 : DEFAULT_DEPTH);
    const moveTime = options.moveTime ?? DEFAULT_MOVE_TIME;

    if (options.skillLevel !== undefined) {
      this.setSkillLevel(options.skillLevel);
    }

    const position =
      moves.length > 0
        ? `position fen ${fen} moves ${moves.join(" ")}`
        : `position fen ${fen}`;

    this.instance.postMessage(position);

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.stop();
        reject(new Error("Stockfish search timed out"));
      }, moveTime + 1000);

      this.pendingSearch = {
        resolve,
        reject,
        latestInfo: {},
        timeoutId,
      };

      if (options.moveTime) {
        this.instance?.postMessage(`go movetime ${options.moveTime}`);
      } else {
        this.instance?.postMessage(`go depth ${depth}`);
      }
    });
  }

  stop(): void {
    this.instance?.postMessage("stop");
    if (this.pendingSearch) {
      this.finishSearch(new Error("Search stopped"));
    }
  }

  destroy(): void {
    this.stop();
    if (this.instance && this.listener) {
      this.instance.removeMessageListener(this.listener);
    }
    this.instance?.terminate();
    this.instance = null;
    this.readyPromise = null;
    this.listener = null;
  }
}

let engineInstance: StockfishEngine | null = null;

export function getStockfishEngine(): StockfishEngine {
  if (!engineInstance) {
    engineInstance = new StockfishEngineImpl();
  }
  return engineInstance;
}

export function resetStockfishEngine(): void {
  engineInstance?.destroy();
  engineInstance = null;
}

export function isStockfishSupported(): boolean {
  return typeof WebAssembly === "object";
}
