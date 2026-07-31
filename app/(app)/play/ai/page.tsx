import { AiGameSetup } from "@/features/coaching/components/ai-game-setup";
import { PlayModeHub } from "@/features/game/components/setup/play-mode-hub";
import { Shield } from "lucide-react";

export default function AiPlayPage() {
  return (
    <PlayModeHub
      icon={Shield}
      title="Play vs Hero"
      description="Random superhero · AI personality · optional banter"
      mode="AI_OPPONENT"
      newGameLabel="New game"
      dialogTitle="Start vs Hero"
      dialogDescription="Choose your side, time control, and hero playing style."
      SetupComponent={AiGameSetup}
    />
  );
}
