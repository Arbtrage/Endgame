import { GameModeRouter } from "@/features/game/components/game-mode-router";

type PageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function ActiveGamePage({ params }: PageProps) {
  const { gameId } = await params;

  return <GameModeRouter gameId={gameId} />;
}
