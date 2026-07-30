"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

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
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled || !value.trim()}>
        Send
      </Button>
    </form>
  );
}
