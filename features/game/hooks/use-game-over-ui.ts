"use client";

import { useEffect, useRef, useState } from "react";

type UseGameOverUiOptions = {
  isFinished: boolean;
  loadedAsCompleted: boolean;
};

export function useGameOverUi({
  isFinished,
  loadedAsCompleted,
}: UseGameOverUiOptions) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const endedLiveRef = useRef(false);

  useEffect(() => {
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
  }, [isFinished, loadedAsCompleted]);

  return {
    dialogOpen,
    dismissDialog: () => setDialogOpen(false),
    showDialog: () => setDialogOpen(true),
    showResultBanner: isFinished && !dialogOpen,
  };
}
