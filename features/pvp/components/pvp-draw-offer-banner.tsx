"use client";

import { Button } from "@/shared/ui/button";

type PvpDrawOfferBannerProps = {
  offeredByName: string;
  opponentName: string;
  isOwnOffer: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
};

export function PvpDrawOfferBanner({
  offeredByName,
  opponentName,
  isOwnOffer,
  onAccept,
  onDecline,
}: PvpDrawOfferBannerProps) {
  if (isOwnOffer) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        Draw offer sent — waiting for {opponentName} to respond
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
      <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
        {offeredByName} offers a draw
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="sm" className="flex-1" onClick={onAccept}>
          Accept
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={onDecline}>
          Decline
        </Button>
      </div>
    </div>
  );
}
