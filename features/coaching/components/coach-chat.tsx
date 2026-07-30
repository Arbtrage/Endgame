"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CoachChatInput } from "@/features/coaching/components/coach-chat-input";
import type { ChatMessage } from "@/features/coaching/types";
import {
  getCoachChatHistory,
  sendCoachChat,
} from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

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

export function CoachChat({ context, className }: CoachChatProps) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const historyQuery = useQuery({
    queryKey: queryKeys.coach.chat(sessionId ?? "latest"),
    queryFn: () => getCoachChatHistory(sessionId ?? undefined),
  });

  const messages: ChatMessage[] = (historyQuery.data?.messages ?? []).map(
    (msg) => ({
      ...msg,
      role: msg.role as "user" | "assistant",
    }),
  );

  const mutation = useMutation({
    mutationFn: (text: string) =>
      sendCoachChat({
        message: text,
        sessionId: sessionId ?? undefined,
        context,
      }),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      queryClient.invalidateQueries({ queryKey: queryKeys.coach.all });
      setMessage("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Coach unavailable");
    },
  });

  const send = (text: string) => {
    if (!text.trim() || mutation.isPending) return;
    mutation.mutate(text.trim());
  };

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug">Endgame Coach</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Ask about openings, tactics, or your games
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
        {historyQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Sparkles className="size-4" />
            </div>
            <p className="text-sm font-medium">Start a conversation</p>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Try one of these prompts or ask anything about chess.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto whitespace-normal px-3 py-1.5 text-left text-xs leading-relaxed"
                  onClick={() => send(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[85%] rounded-xl px-3 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted",
              )}
            >
              {msg.content}
            </div>
          ))
        )}
        {mutation.isPending ? (
          <p className="text-sm text-muted-foreground">Coach is thinking...</p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border/60 bg-muted/10 px-4 py-3 sm:px-5">
        <CoachChatInput
          value={message}
          onChange={setMessage}
          disabled={mutation.isPending}
          onSubmit={() => send(message)}
        />
      </div>
    </div>
  );
}
