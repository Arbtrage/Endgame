import Link from "next/link";
import { APP_NAME } from "@/shared/constants/brand";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-display font-semibold">{APP_NAME}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Chess with a coach that explains.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/auth/sign-in" className="transition-spring hover:text-foreground">
            Sign in
          </Link>
          <Link href="/demo" className="transition-spring hover:text-foreground">
            Demo
          </Link>
          <Link href="/privacy" className="transition-spring hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="transition-spring hover:text-foreground">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
