import { GameSetup } from "@/features/game/components/game-setup";
import { PageHeader } from "@/shared/components/page-header";

export default function ComputerPlayPage() {
  return (
    <div>
      <PageHeader
        title="Play vs Villain"
        description="Face a random Marvel villain at your chosen threat level."
      />
      <GameSetup />
    </div>
  );
}
