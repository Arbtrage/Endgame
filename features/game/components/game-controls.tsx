"use client";

import { Button } from "@/shared/ui/button";
import { Flag, Handshake, RotateCcw } from "lucide-react";

type GameControlsProps = {
  onResign: () => void;
  onFlipBoard: () => void;
  onOfferDraw?: () => void;
  disabled?: boolean;
  hideResign?: boolean;
  hideDrawOffer?: boolean;
  drawOfferPending?: boolean;
};

export function GameControls({
  onResign,
  onFlipBoard,
  onOfferDraw,
  disabled = false,
  hideResign = false,
  hideDrawOffer = false,
  drawOfferPending = false,
}: GameControlsProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          size="sm"
          className={hideResign ? "w-full" : "flex-1"}
          onClick={onFlipBoard}
          disabled={disabled}
        >
          <RotateCcw className="mr-2 size-4" />
          Flip board
        </Button>
        {!hideResign ? (
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
        ) : null}
      </div>
      {!hideDrawOffer && onOfferDraw ? (
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={onOfferDraw}
          disabled={disabled || drawOfferPending}
        >
          <Handshake className="mr-2 size-4" />
          {drawOfferPending ? "Draw offer sent" : "Offer draw"}
        </Button>
      ) : null}
    </div>
  );
}
