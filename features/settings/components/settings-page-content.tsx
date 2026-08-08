"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gear, UserCircle, Palette, GraduationCap } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut } from "@/shared/auth/auth-client";
import { PersonalitySelector } from "@/features/coaching/components/personality-selector";
import {
  BOARD_THEMES,
  type BoardTheme,
} from "@/features/game/types";
import { useBoardStore } from "@/features/game/stores/board-store";
import {
  FeatureHero,
  FeaturePage,
  FeaturePanel,
  FeatureSection,
} from "@/shared/components/feature-page";
import { getProfile, getSettings, updateProfile, updateSettings, deleteAccount } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "board", label: "Board", icon: Palette },
  { id: "coaching", label: "Coaching", icon: GraduationCap },
] as const;

type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];

export function SettingsPageContent() {
  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>("profile");

  return (
    <FeaturePage>
      <FeatureHero
        icon={Gear}
        title="Settings"
        description="Manage your profile, board look, and coaching preferences."
      />
      <FeaturePanel bodyClassName="flex min-h-0 flex-1 flex-col p-0 lg:flex-row">
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border/60 p-3 lg:w-52 lg:flex-col lg:border-b-0 lg:border-r lg:p-4">
          {SETTINGS_SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeSection === section.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <section.icon className="size-4" />
              {section.label}
            </button>
          ))}
        </nav>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {activeSection === "profile" ? <ProfileSection /> : null}
          {activeSection === "board" ? <BoardSection /> : null}
          {activeSection === "coaching" ? <CoachingSection /> : null}
        </div>
      </FeaturePanel>
    </FeaturePage>
  );
}

function ProfileSection() {
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
    return <Skeleton className="h-40 w-full max-w-xl" />;
  }

  const currentName = name ?? profile?.name ?? "";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <FeatureSection
        title="Display name"
        description="Shown on the board and in your game history."
      >
        <div className="space-y-3">
          <Input
            id="display-name"
            value={currentName}
            onChange={(event) => setName(event.target.value)}
          />
          <Button
            onClick={() => mutation.mutate(currentName)}
            disabled={mutation.isPending || !currentName.trim()}
          >
            {mutation.isPending ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </FeatureSection>

      <Separator />

      <FeatureSection title="Email" description="Your sign-in email cannot be changed here.">
        <Input id="email" value={profile?.email ?? ""} disabled />
      </FeatureSection>

      <Separator />

      <AccountDeletionSection />
    </div>
  );
}

function AccountDeletionSection() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (confirmText !== "DELETE") {
      toast.error('Type DELETE to confirm');
      return;
    }
    setPending(true);
    try {
      await deleteAccount();
      await signOut();
      router.push("/");
      toast.success("Account deleted");
    } catch {
      toast.error("Could not delete account");
    } finally {
      setPending(false);
    }
  }

  return (
    <FeatureSection
      title="Delete account"
      description="Permanently remove your account and all associated data."
    >
      <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-muted-foreground">
          This action cannot be undone. Type DELETE to confirm.
        </p>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
        />
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={pending || confirmText !== "DELETE"}
        >
          {pending ? "Deleting…" : "Delete my account"}
        </Button>
      </div>
    </FeatureSection>
  );
}

function BoardSection() {
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
    return <Skeleton className="h-40 w-full max-w-xl" />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <FeatureSection title="Board theme" description="Choose how the chess board looks during play.">
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
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  boardTheme === theme
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/40 hover:bg-muted/30",
                )}
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
      </FeatureSection>

      <Separator />

      <FeatureSection
        title="Default villain level"
        description="Pre-selected threat level when starting a new villain match."
      >
        <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="default-strength">Threat level</Label>
            <span className="font-mono tabular-nums">{defaultStrength}/20</span>
          </div>
          <input
            id="default-strength"
            type="range"
            min={1}
            max={20}
            value={defaultStrength}
            onChange={(event) => setDraftStrength(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
          />
        </div>
      </FeatureSection>

      <Button
        onClick={() =>
          mutation.mutate({
            boardTheme,
            defaultStockfishLevel: defaultStrength,
          })
        }
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Saving..." : "Save board preferences"}
      </Button>
    </div>
  );
}

function CoachingSection() {
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
    <div className="mx-auto max-w-2xl space-y-6">
      <FeatureSection
        title="Default playing style"
        description="Used when you start a hero match without picking a style."
      >
        <PersonalitySelector
          value={effectivePersonality}
          onChange={setPersonality}
        />
      </FeatureSection>

      <Separator />

      <FeatureSection
        title="Auto-explain key moments"
        description="Coach mode can explain blunders and tactics automatically."
      >
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
      </FeatureSection>

      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save coaching preferences"}
      </Button>
    </div>
  );
}

// Re-export for any legacy imports
export { ProfileSection as ProfileForm };
