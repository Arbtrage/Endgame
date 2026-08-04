import { summarizeAnalysis } from "@/shared/engine/accuracy";
import {
  calculateCpLoss,
  calculateEvalGain,
  classifyMove,
} from "@/shared/engine/classification";
import type { Evaluation, SearchOptions, StockfishEngine } from "@/shared/engine/types";
import {
  ANALYSIS_PROFILES,
  getDesktopDepthForMode,
  type AnalysisMode,
} from "@/shared/analysis/profiles";
import type {
  AnalysisMoveInput,
  AnalysisProgress,
  AnalyzeGameMovesResult,
  AnalyzedMove,
  EvalGraphPoint,
} from "@/shared/analysis/types";

const STARTING_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export type AnalyzeGameMovesOptions = {
  moves: AnalysisMoveInput[];
  playerColor: "white" | "black";
  engine: StockfishEngine;
  onProgress?: (progress: AnalysisProgress) => void;
  signal?: AbortSignal;
  analysisMode?: AnalysisMode;
  depth?: number;
};

function buildUciHistory(moves: AnalysisMoveInput[], upToExclusive: number): string[] {
  return moves.slice(0, upToExclusive).map((m) => m.uci);
}

function fenBeforeMove(moves: AnalysisMoveInput[], moveIndex: number): string {
  if (moveIndex === 0) {
    return STARTING_FEN;
  }
  return moves[moveIndex - 1]?.fen ?? STARTING_FEN;
}

function positionCacheKey(fen: string, uciMoves: string[]): string {
  return `${fen}|${uciMoves.join(",")}`;
}

function buildSearchOptions(
  mode: AnalysisMode,
  depth: number,
): SearchOptions {
  const profile = ANALYSIS_PROFILES[mode];
  return {
    depth,
    maxMoveTime: profile.maxMoveTimeMs,
    multiThread: true,
  };
}

export async function analyzeGameMoves(
  options: AnalyzeGameMovesOptions,
): Promise<AnalyzeGameMovesResult> {
  const { moves, playerColor, engine, onProgress, signal } = options;
  const analysisMode = options.analysisMode ?? "standard";
  const depth = options.depth ?? getDesktopDepthForMode(analysisMode);
  const searchOptions = buildSearchOptions(analysisMode, depth);

  await engine.ready();

  const evalCache = new Map<string, Evaluation>();

  async function cachedEvaluate(
    fen: string,
    uciMoves: string[],
  ): Promise<Evaluation> {
    const key = positionCacheKey(fen, uciMoves);
    const cached = evalCache.get(key);
    if (cached) {
      return cached;
    }

    const result = await engine.evaluate(fen, uciMoves, searchOptions);
    evalCache.set(key, result);
    return result;
  }

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
    const prevEval = i === 0 ? 0 : evalGraph[evalGraph.length - 1]!.eval;

    onProgress?.({
      current: i + 1,
      total: moves.length,
      phase: "analyzing",
      message: `Analyzing move ${i + 1} of ${moves.length}`,
    });

    if (!isUserMove) {
      const afterEval = await cachedEvaluate(fenBefore, [...priorUci, move.uci]);
      analyzedMoves.push({
        moveNumber: move.moveNumber,
        san: move.san,
        uci: move.uci,
        fen: move.fen,
        color: move.color as "white" | "black",
        evalBefore: prevEval,
        evalAfter: afterEval.cp,
        bestMove: move.uci,
        classification: "best",
        cpLoss: 0,
        isUserMove: false,
      });
      evalGraph.push({ moveNumber: move.moveNumber, eval: afterEval.cp });
      continue;
    }

    const best = await engine.getBestMove(fenBefore, priorUci, searchOptions);
    const beforeEvalCp = best.eval ?? prevEval;
    const isBestMove = move.uci === best.uci;

    let bestEvalCp: number;
    let afterEvalCp: number;

    if (isBestMove) {
      const afterEval = await cachedEvaluate(fenBefore, [...priorUci, move.uci]);
      afterEvalCp = afterEval.cp;
      bestEvalCp = afterEvalCp;
    } else {
      const bestLineEval = await cachedEvaluate(fenBefore, [...priorUci, best.uci]);
      bestEvalCp = bestLineEval.cp;
      const afterEval = await cachedEvaluate(fenBefore, [...priorUci, move.uci]);
      afterEvalCp = afterEval.cp;
    }

    const cpLoss = calculateCpLoss(
      bestEvalCp,
      afterEvalCp,
      move.color as "white" | "black",
    );
    const evalGain = calculateEvalGain(
      beforeEvalCp,
      afterEvalCp,
      move.color as "white" | "black",
    );
    const classification = classifyMove({ cpLoss, isBestMove, evalGain });

    analyzedMoves.push({
      moveNumber: move.moveNumber,
      san: move.san,
      uci: move.uci,
      fen: move.fen,
      color: move.color as "white" | "black",
      evalBefore: beforeEvalCp,
      evalAfter: afterEvalCp,
      bestMove: best.uci,
      classification,
      cpLoss,
      isUserMove: true,
    });

    evalGraph.push({
      moveNumber: move.moveNumber,
      eval: afterEvalCp,
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
    analysisMode,
    analysisDepth: depth,
  };
}
