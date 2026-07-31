"use client";

import { useEffect } from "react";

type UseReplayKeyboardOptions = {
  moveCount: number;
  reviewIndex: number | null;
  onSelectMove: (index: number) => void;
  onGoLive: () => void;
  enabled?: boolean;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function useReplayKeyboard({
  moveCount,
  reviewIndex,
  onSelectMove,
  onGoLive,
  enabled = true,
}: UseReplayKeyboardOptions) {
  useEffect(() => {
    if (!enabled || moveCount === 0) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;

      const currentIndex = reviewIndex ?? moveCount - 1;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (currentIndex > 0) {
            onSelectMove(currentIndex - 1);
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          if (currentIndex < moveCount - 1) {
            onSelectMove(currentIndex + 1);
          } else if (reviewIndex !== null) {
            onGoLive();
          }
          break;
        case "Home":
          event.preventDefault();
          onSelectMove(0);
          break;
        case "End":
          event.preventDefault();
          onSelectMove(moveCount - 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, moveCount, onGoLive, onSelectMove, reviewIndex]);
}
