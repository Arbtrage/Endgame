import Link from "next/link";
import { MarketingShell } from "@/shared/components/marketing-shell";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="text-3xl font-bold tracking-tight">Privacy policy</h1>
        <p className="mt-4 text-muted-foreground">
          Endgame stores account details, game history, and analysis data to
          provide coaching and progress features. We do not sell personal data.
        </p>
        <p className="mt-4 text-muted-foreground">
          Contact{" "}
          <a href="mailto:arbtrage8@gmail.com" className="text-primary hover:underline">
            arbtrage8@gmail.com
          </a>{" "}
          for data requests or deletion.
        </p>
        <Link href="/" className="mt-8 inline-block text-sm text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
    </MarketingShell>
  );
}
