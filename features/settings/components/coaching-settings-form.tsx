"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PersonalitySelector } from "@/features/coaching/components/personality-selector";
import { getSettings, updateSettings } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";

export function CoachingSettingsForm() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: queryKeys.user.settings,
    queryFn: getSettings,
  });

  const [personality, setPersonality] = useState<string | null>(null);
  const [coachAutoExplain, setCoachAutoExplain] = useState<boolean | null>(null);

  const effectivePersonality =
    personality ?? settings?.defaultAiPersonality ?? "intermediate";
  const effectiveCoachAutoExplain =
    coachAutoExplain ?? settings?.coachAutoExplain ?? true;

  const mutation = useMutation({
    mutationFn: () =>
      updateSettings({
        defaultAiPersonality: effectivePersonality,
        coachAutoExplain: effectiveCoachAutoExplain,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.settings });
      toast.success("Coaching preferences saved");
    },
    onError: () => toast.error("Unable to save preferences"),
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coaching</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <PersonalitySelector
          value={effectivePersonality}
          onChange={setPersonality}
        />

        <div className="space-y-2">
          <Label>Auto-explain key moments</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={effectiveCoachAutoExplain ? "default" : "outline"}
              onClick={() => setCoachAutoExplain(true)}
            >
              On
            </Button>
            <Button
              type="button"
              variant={!effectiveCoachAutoExplain ? "default" : "outline"}
              onClick={() => setCoachAutoExplain(false)}
            >
              Off
            </Button>
          </div>
        </div>

        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save coaching preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}
