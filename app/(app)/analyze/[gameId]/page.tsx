import { GameAnalysisView } from "@/features/analysis/components/game-analysis-view";

type PageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function AnalyzeGamePage({ params }: PageProps) {
  const { gameId } = await params;
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-6">
      <GameAnalysisView gameId={gameId} />
    </div>
  );
}
