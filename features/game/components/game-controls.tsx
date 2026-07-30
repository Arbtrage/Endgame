"use client";

import { Button } from "@/shared/ui/button";
import { Flag, RotateCcw } from "lucide-react";

type GameControlsProps = {
  onResign: () => void;
  onFlipBoard: () => void;
  disabled?: boolean;
};

export function GameControls({
  onResign,
  onFlipBoard,
  disabled = false,
}: GameControlsProps) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row">
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={onFlipBoard}
        disabled={disabled}
      >
        <RotateCcw className="mr-2 size-4" />
        Flip board
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="flex-1"
        onClick={onResign}
        disabled={disabled}
      >
        <Flag className="mr-2 size-4" />
        Resign
      </Button>
    </div>
  );
}
