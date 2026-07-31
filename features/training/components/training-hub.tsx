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
import {
  FeatureHero,
  FeaturePage,
  FeaturePanel,
  FeatureSection,
} from "@/shared/components/feature-page";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
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
        icon={GraduationCap}
        title="Train"
        description="Personalized lessons built from your weaknesses, with interactive puzzles and progressive hints."
      />

      <FeaturePanel>
        <div className="space-y-6">
          <FeatureSection title="Recommendations">
            {recLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
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
                      Generating…
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
            {lessonsLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : lessons && lessons.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {(lessons as LessonDetail[]).map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No lessons yet. Generate your first lesson above.
              </p>
            )}
          </FeatureSection>
        </div>
      </FeaturePanel>
    </FeaturePage>
  );
}
