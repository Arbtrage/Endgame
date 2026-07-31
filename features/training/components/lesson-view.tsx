"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { ExerciseResult } from "@/features/training/components/exercise-result";
import { HintButton } from "@/features/training/components/hint-button";
import { LessonProgressBar } from "@/features/training/components/lesson-progress";
import { PuzzleBoard } from "@/features/training/components/puzzle-board";
import {
  getLesson,
  updateLessonProgress,
  verifyExerciseMove,
} from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

type LessonViewProps = {
  lessonId: string;
};

export function LessonView({ lessonId }: LessonViewProps) {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [showIntro, setShowIntro] = useState(true);

  const { data: lesson, isLoading } = useQuery({
    queryKey: queryKeys.training.lesson(lessonId),
    queryFn: () => getLesson(lessonId),
  });

  const progressMutation = useMutation({
    mutationFn: updateLessonProgress.bind(null, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.training.lesson(lessonId),
      });
    },
  });

  const exerciseIndex =
    currentIndex ?? lesson?.progress?.currentExercise ?? 0;

  const exercise = lesson?.exercises[exerciseIndex];
  const total = lesson?.exercises.length ?? 0;
  const completed = lesson?.progress?.completed ?? false;

  const handleMove = useCallback(
    async (uci: string) => {
      if (!exercise) return false;

      try {
        const { correct } = await verifyExerciseMove(lessonId, {
          exerciseIndex,
          uci,
        });

        setLastResult(correct ? "correct" : "incorrect");

        if (correct) {
          const nextIndex = exerciseIndex + 1;
          const isComplete = nextIndex >= total;
          await progressMutation.mutateAsync({
            currentExercise: isComplete ? exerciseIndex : nextIndex,
            exerciseCorrect: true,
            completed: isComplete,
          });
          if (!isComplete) {
            setTimeout(() => {
              setCurrentIndex(nextIndex);
              setLastResult(null);
            }, 1500);
          }
        }

        return correct;
      } catch {
        return false;
      }
    },
    [exercise, exerciseIndex, lessonId, progressMutation, total],
  );

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!lesson) {
    return <p className="text-sm text-muted-foreground">Lesson not found.</p>;
  }

  if (lesson.status === "GENERATING") {
    return (
      <div className="rounded-xl border border-border/60 p-8 text-center">
        <p className="text-sm font-medium">Generating your lesson…</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This usually takes a few seconds.
        </p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="space-y-4 rounded-xl border border-border/60 p-6 text-center">
        <h2 className="text-xl font-semibold">Lesson complete!</h2>
        <p className="text-sm text-muted-foreground">
          Score: {lesson.progress?.score ?? 0}%
        </p>
        <Button render={<Link href="/train" />} nativeButton={false}>
          Back to training
        </Button>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="space-y-4">
        <Button
          render={<Link href="/train" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="rounded-xl border border-border/60 p-6">
          <h1 className="text-xl font-semibold">{lesson.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {lesson.description}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {total} exercises · {lesson.topic}
          </p>
          <Button type="button" className="mt-4" onClick={() => setShowIntro(false)}>
            Start lesson
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button
          render={<Link href="/train" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <LessonProgressBar current={exerciseIndex + 1} total={total} />
      </div>

      {exercise ? (
        <>
          <p className="text-sm font-medium">{exercise.objective}</p>
          <div className="mx-auto w-full max-w-md">
            <div className="aspect-square w-full overflow-hidden rounded-sm border border-border/60">
              <PuzzleBoard
                key={exercise.id}
                fen={exercise.fen}
                exerciseKey={exercise.id}
                disabled={lastResult === "correct"}
                onMove={handleMove}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <HintButton lessonId={lessonId} exerciseIndex={exerciseIndex} />
          </div>
          {lastResult ? (
            <ExerciseResult
              result={lastResult}
              explanation={exercise.explanation}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
