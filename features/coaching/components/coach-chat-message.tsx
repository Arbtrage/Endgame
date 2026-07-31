"use client";

import type { UIMessage } from "ai";
import { CoachMarkdown } from "@/features/coaching/components/coach-markdown";
import { cn } from "@/shared/lib/utils";
import { getTextFromUIMessage } from "@/features/coaching/utils/chat-messages";

type CoachChatMessageProps = {
  message: UIMessage;
};

export function CoachChatMessage({ message }: CoachChatMessageProps) {
  const text = getTextFromUIMessage(message);
  const isUser = message.role === "user";

  if (!text.trim()) return null;

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[min(85%,42rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border/60 bg-card text-foreground",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <CoachMarkdown content={text} />
        )}
      </div>
    </div>
  );
}
