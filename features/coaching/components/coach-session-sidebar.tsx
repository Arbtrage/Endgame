"use client";

import { MessageSquarePlus } from "lucide-react";
import type { CoachChatSessionSummary } from "@/shared/api/fetcher";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

type CoachSessionSidebarProps = {
  sessions: CoachChatSessionSummary[];
  activeSessionId: string | null;
  loading?: boolean;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  className?: string;
};

function formatSessionLabel(session: CoachChatSessionSummary): string {
  if (session.preview) return session.preview;
  return new Date(session.updatedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CoachSessionSidebar({
  sessions,
  activeSessionId,
  loading = false,
  onSelectSession,
  onNewChat,
  className,
}: CoachSessionSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col bg-muted/20",
        className,
      )}
    >
      <div className="shrink-0 space-y-2 border-b border-border/60 p-3">
        <Button className="w-full justify-start" onClick={onNewChat}>
          <MessageSquarePlus className="mr-2 size-4" />
          New chat
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          History
        </p>

        {loading ? (
          <div className="space-y-2 px-1">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="px-2 py-4 text-xs leading-relaxed text-muted-foreground">
            No conversations yet. Start a new chat to ask your coach about
            openings, tactics, or your games.
          </p>
        ) : (
          <ul className="space-y-1">
            {sessions.map((session) => {
              const active = session.id === activeSessionId;
              return (
                <li key={session.id}>
                  <button
                    type="button"
                    onClick={() => onSelectSession(session.id)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                      active
                        ? "bg-primary/10 text-foreground ring-1 ring-primary/20"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <p className="line-clamp-2 text-sm leading-snug">
                      {formatSessionLabel(session)}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {session.messageCount} messages ·{" "}
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
