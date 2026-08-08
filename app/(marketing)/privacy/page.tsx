import Link from "next/link";
import { MarketingShell } from "@/shared/components/marketing-shell";
import { BezelCard } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";
import { Reveal } from "@/shared/components/reveal";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <Reveal className="mx-auto max-w-2xl px-6 py-24">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
          Privacy policy
        </h1>
        <BezelCard padding="lg" className="mt-8">
          <p className="text-pretty leading-relaxed text-muted-foreground">
            Endgame stores account details, game history, and analysis data to
            provide coaching and progress features. We do not sell personal data.
          </p>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Contact{" "}
            <a
              href="mailto:arbtrage8@gmail.com"
              className="text-primary hover:underline"
            >
              arbtrage8@gmail.com
            </a>{" "}
            for data requests or deletion.
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
