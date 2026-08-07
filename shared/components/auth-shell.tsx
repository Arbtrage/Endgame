import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/shared/constants/brand";
import { cn } from "@/shared/lib/utils";

export function AuthShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-h-screen bg-background lg:grid-cols-2",
        className,
      )}
    >
      <div className="relative hidden overflow-hidden border-r border-border/60 lg:flex lg:flex-col lg:justify-between">
        <div className="surface-grain absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.62_0.14_145_/_0.15),transparent_50%)]" />
        <div className="relative flex flex-1 flex-col justify-center p-12 xl:p-16">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <h1 className="mt-8 max-w-md text-balance text-3xl font-bold tracking-tight xl:text-4xl">
            {APP_TAGLINE}
          </h1>
          <p className="mt-4 max-w-sm text-pretty leading-relaxed text-muted-foreground">
            Engine-backed analysis with an AI coach that explains your games in
            language you can use.
          </p>
          <dl className="mt-10 grid max-w-sm grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/50 bg-card/40 p-4">
              <dt className="text-xs text-muted-foreground">Current streak</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[var(--streak)]">
                4 days
              </dd>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/40 p-4">
              <dt className="text-xs text-muted-foreground">Last game accuracy</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                78.4%
              </dd>
            </div>
          </dl>
          <blockquote className="mt-10 max-w-md border-l-2 border-primary/40 pl-4 text-sm italic text-muted-foreground">
            &ldquo;The knight fork on move 14 was the turning point — you had
            Qd2 instead of recapturing immediately.&rdquo;
          </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
