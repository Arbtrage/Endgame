import { LessonView } from "@/features/training/components/lesson-view";

type PageProps = {
  params: Promise<{ lessonId: string }>;
};

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params;
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-6">
      <LessonView lessonId={lessonId} />
    </div>
  );
}
