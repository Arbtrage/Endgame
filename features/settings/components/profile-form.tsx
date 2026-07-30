"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getProfile, updateProfile } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";
import { useState } from "react";
import { BoardThemePicker } from "@/features/settings/components/board-theme-picker";
import { CoachingSettingsForm } from "@/features/settings/components/coaching-settings-form";

export function ProfileForm() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: getProfile,
  });
  const [name, setName] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (nextName: string) => updateProfile(nextName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Unable to update profile"),
  });

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  const currentName = name ?? profile?.name ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            value={currentName}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile?.email ?? ""} disabled />
        </div>
        <Button
          onClick={() => mutation.mutate(currentName)}
          disabled={mutation.isPending || !currentName.trim()}
        >
          {mutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function SettingsPageContent() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your profile and preferences."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm />
        <BoardThemePicker />
        <div className="lg:col-span-2">
          <CoachingSettingsForm />
        </div>
      </div>
    </div>
  );
}
