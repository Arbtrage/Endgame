"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type OpponentCommentProps = {
  comment: string;
  personalityName?: string;
  className?: string;
};

export function OpponentComment({
  comment,
  personalityName,
  className,
}: OpponentCommentProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm",
        className,
      )}
    >
      {personalityName ? (
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          {personalityName}
        </p>
      ) : null}
      <p>{comment}</p>
    </div>
  );
}

export function OpponentCommentBubble(props: OpponentCommentProps) {
  return (
    <div className="flex items-start gap-2">
      <MessageCircle className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
      <OpponentComment
        {...props}
        className="border-0 bg-transparent p-0 text-xs shadow-none"
      />
    </div>
  );
}
