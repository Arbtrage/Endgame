import { CoachChat } from "@/features/coaching/components/coach-chat";
import {
  FeatureHero,
  FeaturePage,
  FeaturePanel,
} from "@/shared/components/feature-page";
import { MessageCircle } from "lucide-react";

export default function CoachChatPage() {
  return (
    <FeaturePage className="max-w-4xl">
      <FeatureHero
        icon={MessageCircle}
        title="Coach Chat"
        description="Ask your Endgame coach about openings, tactics, or games you've played."
        hint="Open from any game with the coach button for position-aware answers."
      />
      <FeaturePanel bodyClassName="flex min-h-0 flex-1 flex-col p-0">
        <CoachChat className="h-full min-h-0 border-0 bg-transparent" />
      </FeaturePanel>
    </FeaturePage>
  );
}
