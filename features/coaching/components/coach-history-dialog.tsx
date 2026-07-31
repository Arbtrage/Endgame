"use client";

import { CoachSessionSidebar } from "@/features/coaching/components/coach-session-sidebar";
import type { CoachChatSessionSummary } from "@/shared/api/fetcher";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

type CoachHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: CoachChatSessionSummary[];
  activeSessionId: string | null;
  loading?: boolean;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
};

export function CoachHistoryDialog({
  open,
  onOpenChange,
  sessions,
  activeSessionId,
  loading = false,
  onSelectSession,
  onNewChat,
}: CoachHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(85vh,640px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle>Chat history</DialogTitle>
          <DialogDescription>
            Continue a previous conversation or start fresh.
          </DialogDescription>
        </DialogHeader>
        <CoachSessionSidebar
          className="min-h-0 flex-1 border-0 bg-transparent"
          sessions={sessions}
          activeSessionId={activeSessionId}
          loading={loading}
          onSelectSession={onSelectSession}
          onNewChat={onNewChat}
        />
      </DialogContent>
    </Dialog>
  );
}
