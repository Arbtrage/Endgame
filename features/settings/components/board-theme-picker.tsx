"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  BOARD_THEMES,
  type BoardTheme,
} from "@/features/game/types";
import { useBoardStore } from "@/features/game/stores/board-store";
import { useState } from "react";

export function BoardThemePicker() {
  const queryClient = useQueryClient();
  const setTheme = useBoardStore((state) => state.setTheme);
  const { data: settings, isLoading } = useQuery({
    queryKey: queryKeys.user.settings,
    queryFn: getSettings,
  });

  const [draftTheme, setDraftTheme] = useState<BoardTheme | null>(null);
  const [draftStrength, setDraftStrength] = useState<number | null>(null);

  const boardTheme = draftTheme ?? ((settings?.boardTheme as BoardTheme) || "classic");
  const defaultStrength = draftStrength ?? settings?.defaultStockfishLevel ?? 5;

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      setTheme(data.boardTheme as BoardTheme);
      setDraftTheme(null);
      setDraftStrength(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.user.settings });
      toast.success("Preferences saved");
    },
    onError: () => toast.error("Unable to save preferences"),
  });

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Board & game defaults</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Board theme</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(BOARD_THEMES) as BoardTheme[]).map((theme) => {
              const config = BOARD_THEMES[theme];
              return (
                <button
                  key={theme}
                  type="button"
                  onClick={() => {
                    setDraftTheme(theme);
                    setTheme(theme);
                  }}
                  className={`rounded-lg border p-3 text-left ${
                    boardTheme === theme
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border"
                  }`}
                >
                  <div className="mb-2 grid h-10 grid-cols-2 overflow-hidden rounded">
                    <span style={{ backgroundColor: config.light }} />
                    <span style={{ backgroundColor: config.dark }} />
                  </div>
                  <span className="text-sm font-medium">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="default-strength">
            Default villain threat level: {defaultStrength}/20
          </Label>
          <input
            id="default-strength"
            type="range"
            min={1}
            max={20}
            value={defaultStrength}
            onChange={(event) =>
              setDraftStrength(Number(event.target.value))
            }
            className="w-full"
          />
        </div>

        <Button
          onClick={() =>
            mutation.mutate({
              boardTheme,
              defaultStockfishLevel: defaultStrength,
            })
          }
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
