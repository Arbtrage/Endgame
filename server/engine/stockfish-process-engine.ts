import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import os from "node:os";
import type {
  EngineMove,
  Evaluation,
  SearchOptions,
  StockfishEngine,
} from "@/shared/engine/types";

const DEFAULT_DEPTH = 12;

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

function resolveStockfishPath(): string {
  if (process.env.STOCKFISH_PATH) {
    return process.env.STOCKFISH_PATH;
  }

  const candidates = [
    "stockfish",
    "/usr/games/stockfish",
    "/usr/bin/stockfish",
    "/opt/homebrew/bin/stockfish",
  ];

  return candidates[0]!;
}

function getServerThreadCount(): number {
  return Math.min(4, Math.max(1, os.cpus().length));
}

class StockfishProcessEngine implements StockfishEngine {
  private process: ChildProcessWithoutNullStreams | null = null;
  private readyPromise: Promise<void> | null = null;
  private skillLevel = 5;
  private threadCount = 1;
  private hashMb = 128;
  private pendingSearch: {
    resolve: (move: EngineMove) => void;
    reject: (error: Error) => void;
    latestInfo: Partial<EngineMove>;
    timeoutId: ReturnType<typeof setTimeout>;
  } | null = null;
  private searchChain: Promise<void> = Promise.resolve();
  private stdoutBuffer = "";

  private runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.searchChain.then(fn, fn);
    this.searchChain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async ready(): Promise<void> {
    if (this.readyPromise) {
      return this.readyPromise;
    }

    this.readyPromise = this.initialize();
    return this.readyPromise;
  }

  private async initialize(): Promise<void> {
    const stockfishPath = resolveStockfishPath();
    this.process = spawn(stockfishPath, [], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.process.on("error", (error) => {
      if (this.pendingSearch) {
        this.finishSearch(error);
      }
    });

    this.process.stdout.on("data", (chunk: Buffer) => {
      this.stdoutBuffer += chunk.toString("utf8");
      const lines = this.stdoutBuffer.split("\n");
      this.stdoutBuffer = lines.pop() ?? "";
      for (const line of lines) {
        this.handleLine(line.trim());
      }
    });

    await this.sendAndWait("uci", (line) => line === "uciok");
    await this.sendAndWait("isready", (line) => line === "readyok");
    this.applyEngineOptions();
  }

  private handleLine(line: string): void {
    if (!line) return;

    if (this.pendingSearch) {
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

  private write(command: string): void {
    if (!this.process?.stdin.writable) {
      throw new Error("Stockfish process not writable");
    }
    this.process.stdin.write(`${command}\n`);
  }

  private sendAndWait(
    command: string,
    predicate: (line: string) => boolean,
    timeoutMs = 10000,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.process) {
        reject(new Error("Stockfish not initialized"));
        return;
      }

      const timeoutId = setTimeout(() => {
        this.process?.stdout.off("data", onData);
        reject(new Error(`Stockfish command timed out: ${command}`));
      }, timeoutMs);

      const onData = (chunk: Buffer) => {
        const lines = chunk.toString("utf8").split("\n");
        for (const raw of lines) {
          const line = raw.trim();
          if (line && predicate(line)) {
            clearTimeout(timeoutId);
            this.process?.stdout.off("data", onData);
            resolve();
            return;
          }
        }
      };

      this.process.stdout.on("data", onData);
      this.write(command);
    });
  }

  private applyEngineOptions(): void {
    this.write(`setoption name Skill Level value ${this.skillLevel}`);
    this.write(`setoption name Threads value ${this.threadCount}`);
    this.write(`setoption name Hash value ${this.hashMb}`);
  }

  setSkillLevel(level: number): void {
    this.skillLevel = Math.max(0, Math.min(20, level));
    if (this.process) {
      this.applyEngineOptions();
    }
  }

  async getBestMove(
    fen: string,
    moves: string[],
    options: SearchOptions = {},
  ): Promise<EngineMove> {
    return this.search(fen, moves, options);
  }

  async evaluate(
    fen: string,
    moves: string[],
    options: SearchOptions = {},
  ): Promise<Evaluation> {
    const result = await this.search(fen, moves, options);
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
    return this.runExclusive(() => this.runSearch(fen, moves, options));
  }

  private async runSearch(
    fen: string,
    moves: string[],
    options: SearchOptions = {},
  ): Promise<EngineMove> {
    await this.ready();

    if (!this.process) {
      throw new Error("Stockfish not initialized");
    }

    const depth = options.depth ?? DEFAULT_DEPTH;
    const moveTime = options.moveTime;
    const maxMoveTime = options.maxMoveTime;
    const useDepthSearch = options.depth !== undefined && moveTime === undefined;

    if (options.multiThread) {
      this.threadCount = getServerThreadCount();
      this.hashMb = 256;
    } else {
      this.threadCount = 1;
      this.hashMb = 128;
    }
    this.applyEngineOptions();

    if (options.skillLevel !== undefined) {
      this.setSkillLevel(options.skillLevel);
    }

    const position =
      moves.length > 0
        ? `position fen ${fen} moves ${moves.join(" ")}`
        : `position fen ${fen}`;

    this.write(position);

    const timeoutMs = moveTime
      ? moveTime + 1000
      : maxMoveTime
        ? maxMoveTime + 500
        : depth * 400 + 2000;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (!this.pendingSearch) {
          reject(new Error("Stockfish search timed out"));
          return;
        }

        const { latestInfo } = this.pendingSearch;
        clearTimeout(this.pendingSearch.timeoutId);
        this.write("stop");
        this.pendingSearch = null;

        if (latestInfo.eval !== undefined && latestInfo.pv?.[0]) {
          resolve({
            uci: latestInfo.pv[0],
            eval: latestInfo.eval,
            depth: latestInfo.depth ?? depth,
            pv: latestInfo.pv,
          });
          return;
        }

        reject(new Error("Stockfish search timed out"));
      }, timeoutMs);

      this.pendingSearch = {
        resolve,
        reject,
        latestInfo: {},
        timeoutId,
      };

      if (useDepthSearch) {
        this.write(`go depth ${depth}`);
      } else if (moveTime) {
        this.write(`go movetime ${moveTime}`);
      } else {
        this.write(`go depth ${depth}`);
      }
    });
  }

  stop(): void {
    this.write("stop");
    if (this.pendingSearch) {
      clearTimeout(this.pendingSearch.timeoutId);
      this.pendingSearch = null;
    }
  }

  destroy(): void {
    this.stop();
    this.process?.kill();
    this.process = null;
    this.readyPromise = null;
  }
}

let engineInstance: StockfishEngine | null = null;

export function getStockfishProcessEngine(): StockfishEngine {
  if (!engineInstance) {
    engineInstance = new StockfishProcessEngine();
  }
  return engineInstance;
}

export function resetStockfishProcessEngine(): void {
  engineInstance?.destroy();
  engineInstance = null;
}
