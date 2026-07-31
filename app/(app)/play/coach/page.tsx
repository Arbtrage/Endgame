import { CoachGameSetup } from "@/features/coaching/components/coach-game-setup";
import { PlayModeHub } from "@/features/game/components/setup/play-mode-hub";
import { GraduationCap } from "lucide-react";

export default function CoachPlayPage() {
  return (
    <PlayModeHub
      icon={GraduationCap}
      title="Coach Mode"
      description="Villain opponent · live explanations at key moments"
      mode="COACH"
      newGameLabel="New game"
      dialogTitle="Start coached game"
      dialogDescription="Configure your color, villain strength, and optional clock."
      SetupComponent={CoachGameSetup}
    />
  );
}
