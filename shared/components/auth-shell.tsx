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
        "flex min-h-screen items-center justify-center bg-background px-4 py-12",
        className,
      )}
    >
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
