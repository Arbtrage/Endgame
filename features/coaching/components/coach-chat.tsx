"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  return (
    <div className={cn("flex min-h-[420px] flex-col rounded-lg border border-border", className)}>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {historyQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ask about openings, tactics, or your current position.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
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

      <div className="border-t border-border p-3">
        <CoachChatInput
          value={message}
          onChange={setMessage}
          disabled={mutation.isPending}
          onSubmit={() => {
            if (!message.trim()) return;
            mutation.mutate(message.trim());
          }}
        />
      </div>
    </div>
  );
}
