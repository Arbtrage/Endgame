import { DemoGame } from "@/features/game/components/demo-game";
import { MarketingShell } from "@/shared/components/marketing-shell";

export default function DemoPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <DemoGame />
      </div>
    </MarketingShell>
  );
}
