import { GameSetup } from "@/features/game/components/game-setup";
import { PlayModeHub } from "@/features/game/components/setup/play-mode-hub";
import { Skull } from "lucide-react";

export default function ComputerPlayPage() {
  return (
    <PlayModeHub
      icon={Skull}
      title="Play vs Villain"
      description="Random Marvel nemesis · engine-backed · your threat level"
      mode="COMPUTER"
      newGameLabel="New game"
      dialogTitle="Start vs Villain"
      dialogDescription="Pick your color, threat level, and optional time control."
      SetupComponent={GameSetup}
    />
  );
}
