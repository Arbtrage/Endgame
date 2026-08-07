import { CoachChat } from "@/features/coaching/components/coach-chat";
import {
  ViewportPage,
  ViewportPageSection,
} from "@/shared/components/viewport-page";

export default function CoachChatPage() {
  return (
    <ViewportPage className="max-w-6xl">
      <ViewportPageSection
        fill
        className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-card/40 shadow-elevated"
      >
        <CoachChat className="h-full min-h-0" />
      </ViewportPageSection>
    </ViewportPage>
  );
}
