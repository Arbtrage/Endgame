import { CoachChat } from "@/features/coaching/components/coach-chat";
import { BezelPanel } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";
import { FeaturePage } from "@/shared/components/feature-page";

export default function CoachChatPage() {
  return (
    <FeaturePage className="flex min-h-[calc(100dvh-8rem)] flex-col">
      <div className="mb-6">
        <Eyebrow>Ask anything</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
          Coach chat
        </h1>
      </div>
      <BezelPanel padding="none" className="min-h-0 flex-1">
        <CoachChat className="h-full min-h-[480px]" />
      </BezelPanel>
    </FeaturePage>
  );
}
