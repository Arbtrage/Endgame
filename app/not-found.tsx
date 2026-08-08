import { BezelCard } from "@/shared/components/bezel-card";
import { PillCta } from "@/shared/components/pill-cta";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-24">
      <BezelCard padding="lg" className="max-w-md text-center">
        <div className="mx-auto mb-6 grid grid-cols-8 gap-0.5 opacity-20">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className={`size-3 ${(Math.floor(i / 8) + i) % 2 === 0 ? "bg-muted" : "bg-muted/40"}`}
            />
          ))}
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          This position isn&apos;t in the game tree
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground">
          The page you requested doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <PillCta href="/dashboard">Dashboard</PillCta>
          <PillCta href="/play/coach" variant="ghost">
            Coach mode
          </PillCta>
        </div>
      </BezelCard>
    </div>
  );
}
