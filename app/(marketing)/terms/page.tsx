import Link from "next/link";
import { MarketingShell } from "@/shared/components/marketing-shell";

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="text-3xl font-bold tracking-tight">Terms of service</h1>
        <p className="mt-4 text-muted-foreground">
          Endgame is provided as-is for personal chess learning. Do not abuse AI
          endpoints, attempt to disrupt other users, or use the service for
          unlawful purposes.
        </p>
        <p className="mt-4 text-muted-foreground">
          Engine evaluations are authoritative; AI explanations are narrative aids
          and may occasionally be incomplete.
        </p>
        <Link href="/" className="mt-8 inline-block text-sm text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
    </MarketingShell>
  );
}
