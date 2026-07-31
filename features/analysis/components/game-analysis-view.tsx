"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { AnalysisBoard } from "@/features/analysis/components/analysis-board";
import { AnalysisProgressBar } from "@/features/analysis/components/analysis-progress";
import { AnalysisSummary } from "@/features/analysis/components/analysis-summary";
import { EvalGraph } from "@/features/analysis/components/eval-graph";
import { ExplainMovePanel } from "@/features/analysis/components/explain-move-panel";
import { GameSummaryPanel } from "@/features/analysis/components/game-summary-panel";
import { MoveAnalysisList } from "@/features/analysis/components/move-analysis-list";
import { analyzeGame } from "@/features/analysis/engine/analysis-engine";
import type { AnalysisResult, AnalyzedMove, AnalysisProgress } from "@/features/analysis/types";
import {
  explainMove,
  generateGameSummary,
  getAnalysis,
  getGame,
  saveAnalysis,
} from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { toast } from "sonner";

type GameAnalysisViewProps = {
  gameId: string;
};

export function GameAnalysisView({ gameId }: GameAnalysisViewProps) {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedMoveNumber, setSelectedMoveNumber] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: queryKeys.games.detail(gameId),
    queryFn: () => getGame(gameId),
  });

  const { data: storedAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: queryKeys.analysis.detail(gameId),
    queryFn: () => getAnalysis(gameId),
    enabled: !!game,
  });

  const runAnalysis = useCallback(async () => {
    if (!game?.moves.length) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAnalyzing(true);
    setProgress({ current: 0, total: game.moves.length, phase: "analyzing" });

    try {
      const result = await analyzeGame({
        moves: game.moves,
        playerColor: game.playerColor as "white" | "black",
        signal: controller.signal,
        onProgress: setProgress,
      });

      setAnalysis(result);
      await saveAnalysis(gameId, result);
      queryClient.invalidateQueries({ queryKey: queryKeys.analysis.detail(gameId) });
    } catch (error) {
      if (error instanceof Error && error.message !== "Analysis cancelled") {
        toast.error("Analysis failed");
      }
    } finally {
      setAnalyzing(false);
      setProgress(null);
    }
  }, [game, gameId, queryClient]);

  useEffect(() => {
    if (storedAnalysis && !analysis) {
      setAnalysis({
        accuracy: storedAnalysis.accuracy,
        acpl: storedAnalysis.acpl,
        totalMoves: storedAnalysis.totalMoves,
        blunderCount: storedAnalysis.blunderCount,
        mistakeCount: storedAnalysis.mistakeCount,
        inaccuracyCount: storedAnalysis.inaccuracyCount,
        brilliantCount: storedAnalysis.brilliantCount,
        moveAnalysis: storedAnalysis.moveAnalysis as AnalyzedMove[],
        evalGraph: storedAnalysis.evalGraph as AnalysisResult["evalGraph"],
      });
      setSummary(storedAnalysis.summary);
    }
  }, [storedAnalysis, analysis]);

  useEffect(() => {
    if (
      game &&
      game.status === "COMPLETED" &&
      !storedAnalysis &&
      !analysisLoading &&
      !analysis &&
      !analyzing
    ) {
      void runAnalysis();
    }
  }, [game, storedAnalysis, analysisLoading, analysis, analyzing, runAnalysis]);

  const selectedMove = analysis?.moveAnalysis.find(
    (m) => m.moveNumber === selectedMoveNumber,
  );

  const displayFen =
    selectedMove?.fen ??
    game?.moves[game.moves.length - 1]?.fen ??
    game?.finalFen ??
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  async function handleExplain() {
    if (!selectedMove || !game) return;
    setExplaining(true);
    setExplanation(null);
    try {
      const result = await explainMove({
        gameId,
        fen: selectedMove.fen,
        moves: game.moves.slice(0, selectedMove.moveNumber).map((m) => m.uci),
        moveNumber: selectedMove.moveNumber,
        san: selectedMove.san,
        evalBefore: selectedMove.evalBefore,
        evalAfter: selectedMove.evalAfter,
        bestMove: selectedMove.bestMove,
        classification: selectedMove.classification,
      });
      setExplanation(result.explanation);
    } catch {
      toast.error("Could not explain move");
    } finally {
      setExplaining(false);
    }
  }

  async function handleGenerateSummary() {
    setSummaryLoading(true);
    try {
      const result = await generateGameSummary(gameId);
      setSummary(result.summary);
    } catch {
      toast.error("Could not generate summary");
    } finally {
      setSummaryLoading(false);
    }
  }

  if (gameLoading || analysisLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!game) {
    return <p className="text-sm text-muted-foreground">Game not found.</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button
          render={<Link href="/analyze" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          <h1 className="text-lg font-semibold">Game analysis</h1>
        </div>
      </div>

      {analyzing && progress ? (
        <AnalysisProgressBar
          progress={progress}
          onCancel={() => abortRef.current?.abort()}
        />
      ) : null}

      {analysis ? (
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-h-0 flex-col gap-4">
            <AnalysisSummary analysis={analysis} />
            <EvalGraph
              points={analysis.evalGraph}
              selectedMoveNumber={selectedMoveNumber}
            />
            <div className="mx-auto w-full max-w-lg">
              <AnalysisBoard
                fen={displayFen}
                orientation={game.playerColor as "white" | "black"}
              />
            </div>
            <GameSummaryPanel
              summary={summary}
              loading={summaryLoading}
              onGenerate={handleGenerateSummary}
            />
          </div>
          <div className="flex min-h-0 flex-col gap-4 overflow-hidden rounded-xl border border-border/60 bg-card">
            <div className="min-h-0 flex-1 overflow-hidden">
              <MoveAnalysisList
                moves={analysis.moveAnalysis}
                selectedMoveNumber={selectedMoveNumber}
                onSelectMove={(n) => {
                  setSelectedMoveNumber(n);
                  setExplanation(null);
                }}
              />
            </div>
            <div className="shrink-0 border-t border-border/60 p-4">
              <ExplainMovePanel
                move={selectedMove ?? null}
                explanation={explanation}
                loading={explaining}
                onExplain={selectedMove?.isUserMove ? handleExplain : undefined}
              />
            </div>
          </div>
        </div>
      ) : !analyzing ? (
        <div className="rounded-xl border border-border/60 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No analysis available for this game.
          </p>
          <Button type="button" className="mt-4" onClick={() => void runAnalysis()}>
            Run analysis
          </Button>
        </div>
      ) : null}
    </div>
  );
}
