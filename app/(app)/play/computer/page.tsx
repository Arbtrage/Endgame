import { GameSetup } from "@/features/game/components/game-setup";
import { SetupPlayPage } from "@/features/game/components/setup/setup-play-page";
import { Skull } from "lucide-react";

export default function ComputerPlayPage() {
  return (
    <SetupPlayPage
      icon={Skull}
      title="Play vs Villain"
      description="Random Marvel nemesis · engine-backed · your threat level"
    >
      <GameSetup />
    </SetupPlayPage>
  );
}
