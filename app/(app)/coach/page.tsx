import { CoachChat } from "@/features/coaching/components/coach-chat";
import { PageHeader } from "@/shared/components/page-header";

export default function CoachChatPage() {
  return (
    <div>
      <PageHeader
        title="Coach Chat"
        description="Ask your Endgame coach anything."
      />
      <CoachChat className="max-w-2xl" />
    </div>
  );
}
