"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { LessonCard } from "@/features/training/components/lesson-card";
import { TopicFilter } from "@/features/training/components/topic-filter";
import {
  generateLesson,
  getTrainingLessons,
  getTrainingRecommendations,
} from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { EmptyState } from "@/shared/components/empty-state";
import {
  FeatureHero,
  FeaturePage,
  FeaturePanel,
  FeatureSection,
} from "@/shared/components/feature-page";
import { Button } from "@/shared/ui/button";
import { LessonCardSkeleton, Skeleton } from "@/shared/ui/skeleton";
import { toast } from "sonner";
import type { LessonDetail } from "@/shared/api/fetcher";

export function TrainingHub() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState<string | undefined>();

  const { data: recommendations, isLoading: recLoading } = useQuery({
    queryKey: queryKeys.training.recommendations,
    queryFn: getTrainingRecommendations,
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: queryKeys.training.lessons(topic),
    queryFn: () => getTrainingLessons(topic),
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      generateLesson({
        topic: recommendations?.recommendedTopics[0],
        weakness: recommendations?.weaknesses[0]?.tag,
      }),
    onSuccess: (lesson) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.training.lessons() });
      router.push(`/train/${lesson.id}`);
    },
    onError: () => toast.error("Could not generate lesson"),
  });

  return (
    <FeaturePage>
      <FeatureHero
        variant="compact"
        icon={GraduationCap}
        title="Train"
        description="Lessons built from your weaknesses — puzzles with hints, not generic drills."
      />

      <FeaturePanel>
        <div className="space-y-6">
          <FeatureSection title="Recommendations">
            {recLoading ? (
              <Skeleton className="h-24 w-full rounded-xl" />
            ) : (
              <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
                {recommendations?.hasEnoughData ? (
                  <p className="text-sm text-muted-foreground">
                    Focus areas:{" "}
                    {recommendations.weaknesses
                      .map((w) => `${w.tag} (${w.count})`)
                      .join(", ") || "Keep playing to detect patterns"}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Play at least 5 analyzed games for personalized recommendations.
                    Starter lessons are available below.
                  </p>
                )}
                <Button
                  type="button"
                  className="mt-3"
                  disabled={generateMutation.isPending}
                  onClick={() => generateMutation.mutate()}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Generating lesson…
                    </>
                  ) : (
                    "Generate lesson"
                  )}
                </Button>
              </div>
            )}
          </FeatureSection>

          <FeatureSection title="Browse by topic">
            <TopicFilter value={topic} onChange={setTopic} />
          </FeatureSection>

          <FeatureSection title="Your lessons">
            {lessonsLoading || generateMutation.isPending ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <LessonCardSkeleton />
                <LessonCardSkeleton />
              </div>
            ) : lessons && lessons.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {(lessons as LessonDetail[]).map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No lessons yet"
                description="Generate your first lesson from recent mistakes, or play a few more games for better recommendations."
                action={
                  <Button
                    type="button"
                    disabled={generateMutation.isPending}
                    onClick={() => generateMutation.mutate()}
                  >
                    Generate your first lesson
                  </Button>
                }
              />
            )}
          </FeatureSection>
        </div>
      </FeaturePanel>
    </FeaturePage>
  );
}
