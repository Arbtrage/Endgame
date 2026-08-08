"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap } from "@phosphor-icons/react";
import { getStudyPlan } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { BezelCard } from "@/shared/components/bezel-card";
import { iconClass } from "@/shared/components/icon";

export function ActiveLessonsWidget() {
  const { data } = useQuery({
    queryKey: queryKeys.training.studyPlan,
    queryFn: getStudyPlan,
  });

  const lessons = data?.activeLessons ?? [];
  if (lessons.length === 0) return null;

  return (
    <BezelCard padding="md" className="h-full">
      <div className="flex items-center gap-2 text-sm font-medium">
        <GraduationCap className={iconClass("sm")} weight="light" />
        Active lessons
      </div>
      <div className="mt-3 space-y-2">
        {lessons.slice(0, 2).map((lesson) => (
          <Link
            key={lesson.lessonId}
            href={`/train/${lesson.lessonId}`}
            className="block rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm transition-spring hover:bg-white/[0.06]"
          >
            <span className="font-medium">{lesson.title}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {lesson.currentExercise + 1}/{lesson.totalExercises}
            </span>
          </Link>
        ))}
      </div>
    </BezelCard>
  );
}
