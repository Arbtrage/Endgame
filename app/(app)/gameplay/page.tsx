import { GameplayLookupForm } from "@/features/gameplay/components/gameplay-lookup-form";

export default function GameplayPage() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">Gameplay lookup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Paste a game ID to spectate a live or completed game.
        </p>
        <div className="mt-6">
          <GameplayLookupForm />
        </div>
      </div>
    </div>
  );
}
