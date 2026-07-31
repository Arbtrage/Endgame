"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const RECENT_IDS_KEY = "gameplay-recent-ids";
const MAX_RECENT = 3;

function readRecentIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

function saveRecentId(id: string) {
  const trimmed = id.trim();
  if (!trimmed) return;
  const next = [trimmed, ...readRecentIds().filter((item) => item !== trimmed)].slice(
    0,
    MAX_RECENT,
  );
  localStorage.setItem(RECENT_IDS_KEY, JSON.stringify(next));
}

export function GameplayLookupForm() {
  const router = useRouter();
  const [gameId, setGameId] = useState("");
  const [recentIds, setRecentIds] = useState<string[]>(() => readRecentIds());

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = gameId.trim();
    if (!trimmed) return;
    saveRecentId(trimmed);
    setRecentIds(readRecentIds());
    router.push(`/gameplay/${trimmed}`);
  }

  function loadRecent(id: string) {
    saveRecentId(id);
    setRecentIds(readRecentIds());
    router.push(`/gameplay/${id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="game-id">Game ID</Label>
        <Input
          id="game-id"
          value={gameId}
          onChange={(event) => setGameId(event.target.value)}
          placeholder="Paste a game ID (CUID)"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <Button type="submit" disabled={!gameId.trim()} className="w-full">
        Load game
      </Button>
      {recentIds.length > 0 ? (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recent
          </p>
          <ul className="space-y-1">
            {recentIds.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => loadRecent(id)}
                  className="w-full truncate rounded-md px-2 py-1.5 text-left font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {id}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
