import { prisma } from "@/shared/db/prisma";
import type { LessonStatus, LessonTopic, Prisma } from "@prisma/client";

export const lessonRepository = {
  create(data: {
    userId: string;
    title: string;
    description: string;
    topic: LessonTopic;
    difficulty: number;
    sourceWeakness?: string | null;
    status?: LessonStatus;
  }) {
    return prisma.trainingLesson.create({ data });
  },

  findById(id: string) {
    return prisma.trainingLesson.findUnique({
      where: { id },
      include: {
        exercises: { orderBy: { orderIndex: "asc" } },
        progress: true,
      },
    });
  },

  findByUser(
    userId: string,
    filters?: { status?: LessonStatus; topic?: LessonTopic },
  ) {
    return prisma.trainingLesson.findMany({
      where: {
        userId,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.topic ? { topic: filters.topic } : {}),
      },
      include: {
        exercises: { orderBy: { orderIndex: "asc" }, take: 1 },
        progress: { where: { userId } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  updateStatus(id: string, status: LessonStatus) {
    return prisma.trainingLesson.update({
      where: { id },
      data: { status },
    });
  },

  createExercises(
    lessonId: string,
    exercises: Array<{
      orderIndex: number;
      fen: string;
      objective: string;
      solutionUci: string;
      hintLevels: Prisma.InputJsonValue;
      explanation: string;
    }>,
  ) {
    return prisma.exercise.createMany({ data: exercises.map((e) => ({ lessonId, ...e })) });
  },

  upsertProgress(
    userId: string,
    lessonId: string,
    data: {
      currentExercise?: number;
      completed?: boolean;
      score?: number | null;
      exerciseResults?: Prisma.InputJsonValue;
      completedAt?: Date | null;
    },
  ) {
    return prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        ...data,
      },
      update: data,
    });
  },

  findProgress(userId: string, lessonId: string) {
    return prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
  },

  findActiveProgress(userId: string) {
    return prisma.lessonProgress.findMany({
      where: { userId, completed: false },
      include: {
        lesson: {
          include: { exercises: { orderBy: { orderIndex: "asc" } } },
        },
      },
      orderBy: { startedAt: "desc" },
    });
  },
};
