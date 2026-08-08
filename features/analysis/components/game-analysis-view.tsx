"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, RefreshCw } from "lucide-react";
import { AnalysisBoard } from "@/features/analysis/components/analysis-board";
import { AnalysisProgressBar } from "@/features/analysis/components/analysis-progress";
import { AnalysisSummary } from "@/features/analysis/components/analysis-summary";
import { EvalGraph } from "@/features/analysis/components/eval-graph";
import { ExplainMovePanel } from "@/features/analysis/components/explain-move-panel";
import { GameSummaryPanel } from "@/features/analysis/components/game-summary-panel";
import { MoveAnalysisList } from "@/features/analysis/components/move-analysis-list";
import {
  analyzeGame,
  type AnalysisMode,
} from "@/features/analysis/engine/analysis-engine";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { toast } from "sonner";

type GameAnalysisViewProps = {
  gameId: string;
};

function storedToResult(stored: NonNullable<Awaited<ReturnType<typeof getAnalysis>>>): AnalysisResult {
  return {
    accuracy: stored.accuracy,
    acpl: stored.acpl,
    totalMoves: stored.totalMoves,
    blunderCount: stored.blunderCount,
    mistakeCount: stored.mistakeCount,
    inaccuracyCount: stored.inaccuracyCount,
    brilliantCount: stored.brilliantCount,
    moveAnalysis: stored.moveAnalysis as AnalyzedMove[],
    evalGraph: stored.evalGraph as AnalysisResult["evalGraph"],
    analysisMode: (stored.analysisMode as AnalysisMode | null) ?? undefined,
    analysisDepth: stored.analysisDepth ?? undefined,
  };
}

export function GameAnalysisView({ gameId }: GameAnalysisViewProps) {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [reanalyzeOpen, setReanalyzeOpen] = useState(false);
  const [selectedMoveNumber, setSelectedMoveNumber] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const autoRunStartedRef = useRef(false);

  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: queryKeys.games.detail(gameId),
    queryFn: () => getGame(gameId),
  });

  const { data: storedAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: queryKeys.analysis.detail(gameId),
    queryFn: () => getAnalysis(gameId),
    enabled: !!game,
  });

  const runAnalysis = useCallback(
    async (mode: AnalysisMode) => {
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
          analysisMode: mode,
          onProgress: setProgress,
        });

        setAnalysis(result);
        setAnalysisMode(result.analysisMode);
        await saveAnalysis(gameId, {
          accuracy: result.accuracy,
          acpl: result.acpl,
          totalMoves: result.totalMoves,
          blunderCount: result.blunderCount,
          mistakeCount: result.mistakeCount,
          inaccuracyCount: result.inaccuracyCount,
          brilliantCount: result.brilliantCount,
          moveAnalysis: result.moveAnalysis,
          evalGraph: result.evalGraph,
          analysisMode: result.analysisMode,
          analysisDepth: result.analysisDepth,
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.analysis.detail(gameId),
        });
      } catch (error) {
        if (error instanceof Error && error.message !== "Analysis cancelled") {
          toast.error("Analysis failed");
        }
      } finally {
        setAnalyzing(false);
        setProgress(null);
        setReanalyzeOpen(false);
      }
    },
    [game, gameId, queryClient],
  );

  useEffect(() => {
    if (storedAnalysis) {
      setAnalysis(storedToResult(storedAnalysis));
      setAnalysisMode((storedAnalysis.analysisMode as AnalysisMode | null) ?? null);
      setSummary(storedAnalysis.summary);
    }
  }, [storedAnalysis]);

  useEffect(() => {
    if (
      autoRunStartedRef.current ||
      !game ||
      game.status !== "COMPLETED" ||
      storedAnalysis ||
      analysisLoading ||
      analysis ||
      analyzing
    ) {
      return;
    }

    autoRunStartedRef.current = true;
    void runAnalysis("standard");
  }, [
    analysis,
    analysisLoading,
    analyzing,
    game,
    runAnalysis,
    storedAnalysis,
  ]);

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
    <div className="flex min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        {analysis ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={analyzing}
            onClick={() => setReanalyzeOpen(true)}
          >
            <RefreshCw className="size-4" />
            Re-analyze
          </Button>
        ) : null}
      </div>

      {analyzing && progress ? (
        <AnalysisProgressBar
          progress={progress}
          onCancel={() => abortRef.current?.abort()}
        />
      ) : null}

      {analysis ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-4">
            <AnalysisSummary
              analysis={analysis}
              analysisMode={analysisMode ?? analysis.analysisMode}
            />
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
          <div className="flex flex-col gap-4 overflow-hidden rounded-xl border border-border/60 bg-card lg:sticky lg:top-0 lg:h-[calc(100dvh-6rem)] lg:min-h-0 lg:self-start">
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
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={() => void runAnalysis("standard")}>
              Run standard analysis
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void runAnalysis("fast")}
            >
              Run fast analysis
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={reanalyzeOpen} onOpenChange={setReanalyzeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Re-analyze game</DialogTitle>
            <DialogDescription>
              Choose analysis depth. This replaces your saved analysis for this
              game.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="button" onClick={() => void runAnalysis("standard")}>
              Standard (~45–90s)
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void runAnalysis("fast")}
            >
              Fast (~20–40s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
