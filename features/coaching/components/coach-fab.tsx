"use client";

import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { CoachChat } from "@/features/coaching/components/coach-chat";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

type CoachFabProps = {
  context?: {
    fen?: string;
    gameId?: string;
    mode?: string;
  };
};

export function CoachFab({ context }: CoachFabProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        aria-label="Open coach chat"
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Coach Chat</DialogTitle>
          </DialogHeader>
          <CoachChat context={context} />
        </DialogContent>
      </Dialog>
    </>
  );
}

