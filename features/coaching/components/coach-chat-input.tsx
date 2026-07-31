"use client";

import { ArrowUp } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

type CoachChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export function CoachChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "Ask your coach anything...",
}: CoachChatInputProps) {
  const canSend = !disabled && value.trim().length > 0;

  return (
    <form
      className="flex items-end gap-2 rounded-xl border border-border/60 bg-background p-2 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSubmit();
      }}
    >
      <textarea
        value={value}
        rows={1}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (canSend) onSubmit();
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed outline-none",
          "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />
      <Button
        type="submit"
        size="icon-sm"
        className="shrink-0 rounded-lg"
        disabled={!canSend}
        aria-label="Send message"
      >
        <ArrowUp className="size-4" />
      </Button>
    </form>
  );
}
