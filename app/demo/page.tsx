import { DemoGame } from "@/features/game/components/demo-game";
import { MarketingShell } from "@/shared/components/marketing-shell";
import { BezelCard } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";
import { Reveal } from "@/shared/components/reveal";

export default function DemoPage() {
  return (
    <MarketingShell>
      <Reveal className="mx-auto max-w-3xl px-6 py-24">
        <Eyebrow>Try it</Eyebrow>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
          Live demo
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Play a short coach-guided game without signing up.
        </p>
        <BezelCard padding="lg" className="mt-8">
          <DemoGame />
        </BezelCard>
      </Reveal>
    </MarketingShell>
  );
}
