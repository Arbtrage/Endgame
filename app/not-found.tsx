import Link from "next/link";
import { APP_NAME } from "@/shared/constants/brand";
import { Button } from "@/shared/ui/button";

export default function NotFound() {
  return (
    <div className="surface-grain flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mx-auto grid max-w-sm grid-cols-8 gap-0.5 opacity-20">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className={`size-4 ${(Math.floor(i / 8) + i) % 2 === 0 ? "bg-muted" : "bg-muted/40"}`}
          />
        ))}
      </div>
      <h1 className="mt-8 text-balance text-3xl font-bold tracking-tight">
        This position isn&apos;t in the game tree
      </h1>
      <p className="mt-3 max-w-md text-pretty text-muted-foreground">
        The page you requested doesn&apos;t exist or may have moved. Head back to
        {APP_NAME} and pick a mode from the dashboard.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button render={<Link href="/dashboard" />} nativeButton={false}>
          Dashboard
        </Button>
        <Button
          variant="outline"
          render={<Link href="/play/coach" />}
          nativeButton={false}
        >
          Play coach mode
        </Button>
      </div>
    </div>
  );
}
