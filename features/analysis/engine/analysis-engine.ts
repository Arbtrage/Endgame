import type { GameMove } from "@/shared/api/fetcher";
import { summarizeAnalysis } from "@/shared/engine/accuracy";
import {
  calculateCpLoss,
  calculateEvalGain,
  classifyMove,
} from "@/shared/engine/classification";
import { getStockfishEngine } from "@/shared/engine/stockfish-engine";
import type {
  AnalysisProgress,
  AnalysisResult,
  AnalyzedMove,
  EvalGraphPoint,
} from "../types";

const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export type AnalyzeGameOptions = {
  moves: GameMove[];
  playerColor: "white" | "black";
  onProgress?: (progress: AnalysisProgress) => void;
  signal?: AbortSignal;
  depth?: number;
};

function getAnalysisDepth(): number {
  if (typeof window === "undefined") {
    return 18;
  }
  return window.matchMedia("(max-width: 768px)").matches ? 15 : 18;
}

function buildUciHistory(moves: GameMove[], upToExclusive: number): string[] {
  return moves.slice(0, upToExclusive).map((m) => m.uci);
}

function fenBeforeMove(moves: GameMove[], moveIndex: number): string {
  if (moveIndex === 0) {
    return STARTING_FEN;
  }
  return moves[moveIndex - 1]?.fen ?? STARTING_FEN;
}

export async function analyzeGame(
  options: AnalyzeGameOptions,
): Promise<AnalysisResult> {
  const { moves, playerColor, onProgress, signal } = options;
  const depth = options.depth ?? getAnalysisDepth();
  const moveTime = depth >= 18 ? 5000 : 3000;
  const engine = getStockfishEngine();
  await engine.ready();

  const analyzedMoves: AnalyzedMove[] = [];
  const evalGraph: EvalGraphPoint[] = [{ moveNumber: 0, eval: 0 }];

  for (let i = 0; i < moves.length; i++) {
    if (signal?.aborted) {
      onProgress?.({
        current: i,
        total: moves.length,
        phase: "cancelled",
      });
      throw new Error("Analysis cancelled");
    }

    const move = moves[i]!;
    const fenBefore = fenBeforeMove(moves, i);
    const priorUci = buildUciHistory(moves, i);
    const isUserMove = move.color === playerColor;

    onProgress?.({
      current: i + 1,
      total: moves.length,
      phase: "analyzing",
      message: `Analyzing move ${i + 1} of ${moves.length}`,
    });

    const beforeEval = await engine.evaluate(fenBefore, priorUci, {
      depth,
      moveTime,
    });

    const best = await engine.getBestMove(fenBefore, priorUci, {
      depth,
      moveTime,
    });

    const bestEval = await engine.evaluate(fenBefore, [...priorUci, best.uci], {
      depth,
      moveTime,
    });

    const afterEval = await engine.evaluate(fenBefore, [...priorUci, move.uci], {
      depth,
      moveTime,
    });

    const cpLoss = calculateCpLoss(bestEval.cp, afterEval.cp, move.color as "white" | "black");
    const evalGain = calculateEvalGain(
      beforeEval.cp,
      afterEval.cp,
      move.color as "white" | "black",
    );
    const isBestMove = move.uci === best.uci;
    const classification = classifyMove({ cpLoss, isBestMove, evalGain });

    analyzedMoves.push({
      moveNumber: move.moveNumber,
      san: move.san,
      uci: move.uci,
      fen: move.fen,
      color: move.color as "white" | "black",
      evalBefore: beforeEval.cp,
      evalAfter: afterEval.cp,
      bestMove: best.uci,
      classification,
      cpLoss,
      isUserMove,
    });

    evalGraph.push({
      moveNumber: move.moveNumber,
      eval: afterEval.cp,
    });
  }

  const summary = summarizeAnalysis(analyzedMoves);

  onProgress?.({
    current: moves.length,
    total: moves.length,
    phase: "complete",
  });

  return {
    accuracy: summary.accuracy,
    acpl: summary.acpl,
    totalMoves: moves.length,
    blunderCount: summary.blunderCount,
    mistakeCount: summary.mistakeCount,
    inaccuracyCount: summary.inaccuracyCount,
    brilliantCount: summary.brilliantCount,
    moveAnalysis: analyzedMoves,
    evalGraph,
  };
}
