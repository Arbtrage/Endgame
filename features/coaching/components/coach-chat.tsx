"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Loader2, MessageSquarePlus, Sparkles } from "lucide-react";
import { CoachChatInput } from "@/features/coaching/components/coach-chat-input";
import { CoachChatMessage } from "@/features/coaching/components/coach-chat-message";
import { CoachHistoryDialog } from "@/features/coaching/components/coach-history-dialog";
import { useCoachChat } from "@/features/coaching/hooks/use-coach-chat";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

const STARTER_PROMPTS = [
  "Explain the Italian Game",
  "How do I punish early queen moves?",
  "What should I do in this endgame?",
];

type CoachChatProps = {
  context?: {
    fen?: string;
    gameId?: string;
    mode?: string;
  };
  className?: string;
};

function ChatMessageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-3 px-4 py-4 sm:px-6">
      <Skeleton className="ml-auto h-12 w-2/3 max-w-md rounded-xl" />
      <Skeleton className="h-16 w-4/5 max-w-xl rounded-xl" />
      <Skeleton className="ml-auto h-10 w-1/2 max-w-sm rounded-xl" />
    </div>
  );
}

export function CoachChat({ context, className }: CoachChatProps) {
  const chat = useCoachChat({ context });
  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [chat.messages, chat.isStreaming]);

  const handleSend = async () => {
    const text = input;
    setInput("");
    await chat.send(text);
  };

  const handleHistoryOpen = () => {
    void chat.refetchSessions();
    setHistoryOpen(true);
  };

  const showEmptyState =
    !chat.historyLoading && chat.messages.length === 0 && !chat.isStreaming;

  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden", className)}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 sm:px-5">
        <div className="min-w-0">
          <h1 className="text-sm font-semibold leading-snug sm:text-base">
            Coach Chat
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            Ask about openings, tactics, and your games
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Chat history"
            onClick={handleHistoryOpen}
          >
            <Clock className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="New chat"
            onClick={() => chat.startNewChat()}
          >
            <MessageSquarePlus className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex h-full min-h-0 flex-col">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          {chat.historyLoading ? (
            <ChatMessageSkeleton />
          ) : showEmptyState ? (
            <div className="mx-auto flex h-full min-h-48 max-w-3xl flex-col items-center justify-center px-4 py-10 text-center sm:px-6">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Sparkles className="size-4" />
              </div>
              <p className="text-sm font-medium">Start a conversation</p>
              <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Try a prompt below or ask anything about chess.
              </p>
              <div className="mt-5 flex w-full max-w-md flex-col gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    className="h-auto w-full justify-start whitespace-normal px-3 py-2.5 text-left text-xs leading-relaxed"
                    disabled={chat.status !== "ready"}
                    onClick={() => void chat.send(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 sm:px-6 sm:py-5">
              {chat.messages.map((message) => (
                <CoachChatMessage key={message.id} message={message} />
              ))}
              {chat.isStreaming ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Coach is thinking…
                </div>
              ) : null}
              {chat.error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Something went wrong.{" "}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => void chat.regenerate()}
                  >
                    Retry
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border/60 bg-muted/10 px-4 py-3 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <CoachChatInput
              value={input}
              onChange={setInput}
              disabled={chat.status !== "ready" || chat.historyLoading}
              onSubmit={() => void handleSend()}
            />
          </div>
        </div>
      </div>

      <CoachHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        sessions={chat.sessions}
        activeSessionId={chat.activeSessionId}
        loading={chat.sessionsLoading}
        onSelectSession={(sessionId) => {
          void chat.selectSession(sessionId);
          setHistoryOpen(false);
        }}
        onNewChat={() => {
          chat.startNewChat();
          setHistoryOpen(false);
        }}
      />
    </div>
  );
}
