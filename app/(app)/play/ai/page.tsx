import { AiGameSetup } from "@/features/coaching/components/ai-game-setup";
import { PageHeader } from "@/shared/components/page-header";

export default function AiPlayPage() {
  return (
    <div>
      <PageHeader
        title="Play vs AI"
        description="Choose a personality and play."
      />
      <AiGameSetup />
    </div>
  );
}
