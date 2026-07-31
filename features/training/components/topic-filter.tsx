"use client";

import { cn } from "@/shared/lib/utils";

const TOPICS = [
  { id: undefined, label: "All" },
  { id: "TACTICS", label: "Tactics" },
  { id: "ENDGAME", label: "Endgame" },
  { id: "OPENING", label: "Opening" },
  { id: "POSITIONAL", label: "Positional" },
] as const;

type TopicFilterProps = {
  value?: string;
  onChange: (topic: string | undefined) => void;
};

export function TopicFilter({ value, onChange }: TopicFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TOPICS.map((topic) => (
        <button
          key={topic.label}
          type="button"
          onClick={() => onChange(topic.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            value === topic.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-muted-foreground hover:bg-muted",
          )}
        >
          {topic.label}
        </button>
      ))}
    </div>
  );
}
