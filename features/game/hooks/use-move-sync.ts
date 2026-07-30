import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { recordMove } from "@/shared/api/fetcher";
import type { GameMove } from "@/features/game/types";

export function useMoveSync(gameId: string, persist: boolean) {
  const syncInProgressRef = useRef(false);

  const persistMove = useCallback(
    async (record: GameMove) => {
      if (!persist) return true;

      syncInProgressRef.current = true;
      try {
        await recordMove(gameId, {
          san: record.san,
          uci: record.uci,
          fen: record.fen,
        });
        return true;
      } catch {
        toast.error("Move saved locally but failed to sync");
        return false;
      } finally {
        syncInProgressRef.current = false;
      }
    },
    [gameId, persist],
  );

  const isSyncInProgress = useCallback(
    () => syncInProgressRef.current,
    [],
  );

  return { persistMove, isSyncInProgress, syncInProgressRef };
}
