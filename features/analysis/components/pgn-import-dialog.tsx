"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { importPgn } from "@/shared/api/fetcher";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";

type PGNImportDialogProps = {
  onImported: (gameId: string) => void;
};

export function PGNImportDialog({ onImported }: PGNImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [pgn, setPgn] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    if (!pgn.trim()) {
      toast.error("Paste a PGN first");
      return;
    }
    setLoading(true);
    try {
      const result = await importPgn(pgn.trim());
      toast.success("Game imported");
      setOpen(false);
      setPgn("");
      onImported(result.gameId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import PGN",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Upload className="size-4" />
        Import PGN
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import PGN</DialogTitle>
          <DialogDescription>
            Paste a PGN to analyze an external game.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="pgn-input">PGN text</Label>
          <textarea
            id="pgn-input"
            value={pgn}
            onChange={(e) => setPgn(e.target.value)}
            rows={8}
            placeholder='[Event "?"]...'
            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleImport} disabled={loading}>
            {loading ? "Importing…" : "Import & analyze"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
