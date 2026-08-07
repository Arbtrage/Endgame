import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LessonDetail } from "@/shared/api/fetcher";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";

type LessonCardProps = {
  lesson: LessonDetail;
};

export function LessonCard({ lesson }: LessonCardProps) {
  const completed = lesson.progress?.completed;
  const progress = lesson.progress;

  return (
    <Link
      href={`/train/${lesson.id}`}
      className={cn(
        "group flex h-full flex-col rounded-xl border border-border/50 bg-card/60 p-4 shadow-elevated transition-[box-shadow,border-color] duration-200",
        "hover:border-primary/30 hover:shadow-elevated-hover",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{lesson.title}</h3>
        <Badge variant="outline">{lesson.topic}</Badge>
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {lesson.description}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
        <span>
          {lesson.exercises.length} exercises · Level {lesson.difficulty}
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-primary">
          {progress ? (completed ? "Review" : "Continue") : "Start"}
          <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
