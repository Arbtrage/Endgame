import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/shared/constants/brand";
import { BezelCard } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";

export function AuthShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid min-h-[100dvh] bg-background lg:grid-cols-2 ${className ?? ""}`}>
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center lg:p-12 xl:p-16">
        <div className="absolute inset-0 bg-mesh opacity-80" />
        <div className="relative max-w-md space-y-8">
          <Link href="/" className="font-display text-lg font-semibold">
            {APP_NAME}
          </Link>
          <div className="space-y-4">
            <Eyebrow>Endgame</Eyebrow>
            <h1 className="font-display text-4xl font-bold tracking-tight xl:text-5xl">
              {APP_TAGLINE}
            </h1>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Engine-backed analysis with an AI coach that explains your games
              in language you can use.
            </p>
          </div>
          <BezelCard padding="md">
            <p className="font-mono text-xs text-muted-foreground">Coach insight</p>
            <p className="mt-2 text-sm italic leading-relaxed text-foreground/90">
              &ldquo;The knight fork on move 14 was the turning point — Qd2
              instead of recapturing immediately keeps the initiative.&rdquo;
            </p>
          </BezelCard>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-24 lg:py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
