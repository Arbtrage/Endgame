import { AiGameSetup } from "@/features/coaching/components/ai-game-setup";
import { SetupPlayPage } from "@/features/game/components/setup/setup-play-page";
import { Shield } from "lucide-react";

export default function AiPlayPage() {
  return (
    <SetupPlayPage
      icon={Shield}
      title="Play vs Hero"
      description="Random superhero · AI personality · optional banter"
    >
      <AiGameSetup />
    </SetupPlayPage>
  );
}
