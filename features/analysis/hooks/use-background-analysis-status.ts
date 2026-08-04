"use client";

import { useEffect, useState } from "react";
import { getAnalysisStatus, type AnalysisJobStatus } from "@/shared/api/fetcher";

export type BackgroundAnalysisStatus =
  | "idle"
  | "queued"
  | "running"
  | "done"
  | "error";

function mapJobStatus(status: AnalysisJobStatus): BackgroundAnalysisStatus {
  switch (status) {
    case "pending":
      return "queued";
    case "running":
      return "running";
    case "done":
      return "done";
    case "failed":
      return "error";
    default:
      return "idle";
  }
}

export function useBackgroundAnalysisStatus(gameId?: string) {
  const [status, setStatus] = useState<BackgroundAnalysisStatus>("idle");

  useEffect(() => {
    if (!gameId) {
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    async function poll() {
      try {
        const result = await getAnalysisStatus(gameId!);
        if (cancelled) return;

        const nextStatus = mapJobStatus(result.status);
        setStatus(nextStatus);

        if (nextStatus === "queued" || nextStatus === "running") {
          if (!intervalId) {
            intervalId = setInterval(poll, 4000);
          }
        } else if (intervalId) {
          clearInterval(intervalId);
          intervalId = undefined;
        }
      } catch {
        if (!cancelled) {
          setStatus("idle");
        }
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameId]);

  return status;
}

export function getAnalysisBackgroundHint(
  status: BackgroundAnalysisStatus,
): string | undefined {
  if (status === "running" || status === "queued") {
    return "Full analysis running in the background…";
  }
  return undefined;
}
