"use client";

import { useEffect, useRef, useState } from "react";

type UseGameOverUiOptions = {
  isFinished: boolean;
  loadedAsCompleted: boolean;
  /** Wait until the active game is loaded and store matches route gameId */
  ready?: boolean;
};

export function useGameOverUi({
  isFinished,
  loadedAsCompleted,
  ready = true,
}: UseGameOverUiOptions) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const endedLiveRef = useRef(false);

  useEffect(() => {
    if (!ready) {
      endedLiveRef.current = false;
      setDialogOpen(false);
      return;
    }

    if (!isFinished) {
      endedLiveRef.current = false;
      setDialogOpen(false);
      return;
    }

    if (loadedAsCompleted) {
      setDialogOpen(false);
      return;
    }

    if (!endedLiveRef.current) {
      endedLiveRef.current = true;
      setDialogOpen(true);
    }
  }, [isFinished, loadedAsCompleted, ready]);

  return {
    dialogOpen,
    dismissDialog: () => setDialogOpen(false),
    showDialog: () => setDialogOpen(true),
    showResultBanner: isFinished && !dialogOpen,
  };
}
