import { GameplayLookupForm } from "@/features/gameplay/components/gameplay-lookup-form";
import { BezelCard } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";
import { FeaturePage } from "@/shared/components/feature-page";

export default function GameplayPage() {
  return (
    <FeaturePage className="flex items-center justify-center">
      <BezelCard padding="lg" className="w-full max-w-md">
        <Eyebrow>Spectate</Eyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
          Gameplay lookup
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Paste a game ID to spectate a live or completed game.
        </p>
        <div className="mt-6">
          <GameplayLookupForm />
        </div>
      </BezelCard>
    </FeaturePage>
  );
}
