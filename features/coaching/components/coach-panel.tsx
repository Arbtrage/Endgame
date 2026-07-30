"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CoachMessage } from "@/features/coaching/components/coach-message";
import type { CoachExplanation } from "@/features/coaching/types";

type CoachPanelProps = {
  explanations: CoachExplanation[];
  onAskFollowUp?: (question: string) => void;
  loading?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function CoachPanel({
  explanations,
  onAskFollowUp,
  loading = false,
  collapsed = false,
  onToggleCollapse,
}: CoachPanelProps) {
  const [question, setQuestion] = useState("");

  if (collapsed) {
    return (
      <div className="flex h-full min-h-0 items-start rounded-xl border border-border p-3">
        <Button variant="outline" size="sm" onClick={onToggleCollapse}>
          Show coach ({explanations.length})
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-medium">Coach</h2>
        {onToggleCollapse ? (
          <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
            Hide
          </Button>
        ) : null}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {explanations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Your coach will explain key moments as you play.
          </p>
        ) : (
          explanations.map((item) => (
            <CoachMessage
              key={item.id}
              momentType={item.momentType}
              explanation={item.explanation}
              concepts={item.concepts}
            />
          ))
        )}
        {loading ? (
          <p className="text-sm text-muted-foreground">Coach is thinking...</p>
        ) : null}
      </div>

      {onAskFollowUp ? (
        <form
          className="flex gap-2 border-t border-border p-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!question.trim()) return;
            onAskFollowUp(question.trim());
            setQuestion("");
          }}
        >
          <Input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a follow-up..."
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !question.trim()}>
            Ask
          </Button>
        </form>
      ) : null}
    </div>
  );
}
