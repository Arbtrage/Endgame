import { CoachGameSetup } from "@/features/coaching/components/coach-game-setup";
import { PageHeader } from "@/shared/components/page-header";

export default function CoachPlayPage() {
  return (
    <div>
      <PageHeader
        title="Coach Mode"
        description="Play with live AI coaching."
      />
      <CoachGameSetup />
    </div>
  );
}
