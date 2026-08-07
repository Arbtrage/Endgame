import { cn } from "@/shared/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted/80", className)}
      {...props}
    />
  )
}

function StatTileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5", className)}>
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-6 w-12" />
    </div>
  )
}

function GameRowSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border border-border/40 px-3 py-3", className)}>
      <Skeleton className="size-9 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-14 rounded-full" />
    </div>
  )
}

function CoachMessageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-3", className)}>
      <Skeleton className="size-8 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  )
}

function LessonCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full flex-col rounded-xl border border-border/40 p-4", className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-2/3" />
      <div className="mt-auto pt-6">
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  StatTileSkeleton,
  GameRowSkeleton,
  CoachMessageSkeleton,
  LessonCardSkeleton,
}
