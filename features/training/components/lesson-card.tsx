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
        "group flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4 transition-all",
        "hover:border-primary/40 hover:bg-muted/20",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium leading-snug">{lesson.title}</h3>
        <Badge variant="outline">{lesson.topic}</Badge>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {lesson.description}
      </p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {lesson.exercises.length} exercises · Level {lesson.difficulty}
        </span>
        {progress ? (
          <span>{completed ? "Completed" : `Exercise ${progress.currentExercise + 1}`}</span>
        ) : null}
        <ChevronRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}
