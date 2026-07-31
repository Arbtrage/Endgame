"use client";

import { useEffect, useRef, useState } from "react";
import { CoachChatInput } from "@/features/coaching/components/coach-chat-input";
import { cn } from "@/shared/lib/utils";
import type { GameChatMessage } from "@/shared/api/fetcher";

type PvpChatPanelProps = {
  messages: GameChatMessage[];
  currentUserId: string;
  disabled?: boolean;
  onSend: (content: string) => void;
};

export function PvpChatPanel({
  messages,
  currentUserId,
  disabled = false,
  onSend,
}: PvpChatPanelProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Chat
      </p>
      <div
        ref={scrollRef}
        className="max-h-28 min-h-16 flex-1 space-y-2 overflow-y-auto rounded-lg border border-border/60 bg-muted/20 p-2 sm:max-h-32 lg:max-h-36"
      >
        {messages.length === 0 ? (
          <p className="px-1 py-2 text-xs text-muted-foreground">
            Say hello to your opponent
          </p>
        ) : (
          messages.map((message) => {
            const isOwn = message.userId === currentUserId;
            return (
              <div
                key={message.id}
                className={cn("flex", isOwn ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border/60",
                  )}
                >
                  {!isOwn ? (
                    <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                      {message.userName ?? "Opponent"}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <CoachChatInput
        value={draft}
        onChange={setDraft}
        disabled={disabled}
        placeholder="Message opponent…"
        onSubmit={() => {
          const content = draft.trim();
          if (!content) return;
          onSend(content);
          setDraft("");
        }}
      />
    </div>
  );
}
