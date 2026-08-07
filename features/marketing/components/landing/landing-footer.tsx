import Link from "next/link";
import { APP_NAME } from "@/shared/constants/brand";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{APP_NAME}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Chess with a coach that actually explains.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/auth/sign-in" className="hover:text-foreground">
            Sign in
          </Link>
          <Link href="/demo" className="hover:text-foreground">
            Demo
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
