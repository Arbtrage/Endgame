"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

type PromotionDialogProps = {
  open: boolean;
  color: "white" | "black";
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
  onClose: () => void;
};

const PIECES = [
  { piece: "q" as const, label: "Queen" },
  { piece: "r" as const, label: "Rook" },
  { piece: "b" as const, label: "Bishop" },
  { piece: "n" as const, label: "Knight" },
];

export function PromotionDialog({
  open,
  color,
  onSelect,
  onClose,
}: PromotionDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onSelect("q");
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Promote pawn</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {PIECES.map(({ piece, label }) => (
            <Button
              key={piece}
              variant="outline"
              onClick={() => {
                onSelect(piece);
                onClose();
              }}
            >
              {color === "white" ? label : label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
