import Link from "next/link";
import { APP_NAME } from "@/shared/constants/brand";
import { cn } from "@/shared/lib/utils";

export function MarketingShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
