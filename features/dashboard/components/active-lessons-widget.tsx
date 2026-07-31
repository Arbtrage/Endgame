"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { getStudyPlan } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";

export function ActiveLessonsWidget() {
  const { data } = useQuery({
    queryKey: queryKeys.training.studyPlan,
    queryFn: getStudyPlan,
  });

  const lessons = data?.activeLessons ?? [];
  if (lessons.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <GraduationCap className="size-4 text-primary" />
        Active lessons
      </div>
      {lessons.slice(0, 2).map((lesson) => (
        <Link
          key={lesson.lessonId}
          href={`/train/${lesson.lessonId}`}
          className="block rounded-lg border border-border/60 px-3 py-2 text-sm hover:bg-muted/20"
        >
          <span className="font-medium">{lesson.title}</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {lesson.currentExercise + 1}/{lesson.totalExercises}
          </span>
        </Link>
      ))}
    </div>
  );
}
