import { CoachGameSetup } from "@/features/coaching/components/coach-game-setup";
import { SetupPlayPage } from "@/features/game/components/setup/setup-play-page";
import { GraduationCap } from "lucide-react";

export default function CoachPlayPage() {
  return (
    <SetupPlayPage
      icon={GraduationCap}
      title="Coach Mode"
      description="Villain opponent · live explanations at key moments"
    >
      <CoachGameSetup />
    </SetupPlayPage>
  );
}
