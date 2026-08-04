import { GameAnalysisView } from "@/features/analysis/components/game-analysis-view";
import {
  ViewportPage,
  ViewportPageSection,
} from "@/shared/components/viewport-page";

type PageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function AnalyzeGamePage({ params }: PageProps) {
  const { gameId } = await params;
  return (
    <ViewportPage>
      <ViewportPageSection
        scrollable
        fill
        className="flex min-h-0 flex-col p-4 lg:p-6"
      >
        <GameAnalysisView gameId={gameId} />
      </ViewportPageSection>
    </ViewportPage>
  );
}
