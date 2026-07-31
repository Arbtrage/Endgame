import { SpectatorGameView } from "@/features/gameplay/components/spectator-game-view";

type PageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function GameplaySpectatorPage({ params }: PageProps) {
  const { gameId } = await params;
  return <SpectatorGameView gameId={gameId} />;
}
