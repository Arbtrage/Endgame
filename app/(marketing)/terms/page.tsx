import Link from "next/link";
import { MarketingShell } from "@/shared/components/marketing-shell";
import { BezelCard } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";
import { Reveal } from "@/shared/components/reveal";

export default function TermsPage() {
  return (
    <MarketingShell>
      <Reveal className="mx-auto max-w-2xl px-6 py-24">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
          Terms of service
        </h1>
        <BezelCard padding="lg" className="mt-8">
          <p className="text-pretty leading-relaxed text-muted-foreground">
            Endgame is provided as-is for personal chess learning. Do not abuse
            AI endpoints, attempt to disrupt other users, or use the service for
            unlawful purposes.
          </p>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Engine evaluations are authoritative; AI explanations are narrative
            aids and may occasionally be incomplete.
          </p>
        </BezelCard>
        <Link
          href="/"
          className="mt-8 inline-block text-sm text-primary hover:underline"
        >
          ← Back to home
        </Link>
      </Reveal>
    </MarketingShell>
  );
}
