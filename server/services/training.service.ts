import { ApiError } from "@/server/api/response";
import { getAIProvider, isAIConfigured } from "@/server/ai/factory";
import { GeminiProvider } from "@/server/ai/gemini.provider";
import { validateUciMove } from "@/server/ai/move-validator";
import { buildHintGenerationPrompt } from "@/server/ai/prompts/hint-generation";
import { buildLessonGenerationPrompt } from "@/server/ai/prompts/lesson-generation";
import { analysisRepository } from "@/server/repositories/analysis.repository";
import { lessonRepository } from "@/server/repositories/lesson.repository";
import { prisma } from "@/shared/db/prisma";
import type { LessonTopic } from "@prisma/client";
import { parseGeminiResponse } from "@/server/ai/parser";
import { z } from "zod";

const lessonResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  topic: z.enum(["TACTICS", "ENDGAME", "OPENING", "POSITIONAL", "CUSTOM"]),
  difficulty: z.number().min(1).max(10),
  exercises: z.array(
    z.object({
      fen: z.string(),
      objective: z.string(),
      solutionUci: z.string(),
      hintLevels: z.array(z.string()).min(1).max(3),
      explanation: z.string(),
    }),
  ),
});

const hintResponseSchema = z.object({
  hint: z.string(),
});

const WEAKNESS_TOPICS: Record<string, LessonTopic> = {
  blunder: "TACTICS",
  mistake: "TACTICS",
  inaccuracy: "POSITIONAL",
  endgame: "ENDGAME",
  opening: "OPENING",
};

function ensureAIConfigured() {
  if (!isAIConfigured()) {
    throw new ApiError(
      "SERVICE_UNAVAILABLE",
      "AI training is not configured",
      503,
    );
  }
}

function validateExercise(fen: string, solutionUci: string): boolean {
  try {
    const result = validateUciMove(fen, [], solutionUci);
    return result.valid;
  } catch {
    return false;
  }
}

function mapLesson(
  lesson: NonNullable<Awaited<ReturnType<typeof lessonRepository.findById>>>,
  userId: string,
) {
  const progress = lesson.progress.find((p) => p.userId === userId);
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    topic: lesson.topic,
    difficulty: lesson.difficulty,
    status: lesson.status,
    sourceWeakness: lesson.sourceWeakness,
    createdAt: lesson.createdAt.toISOString(),
    exercises: lesson.exercises.map((e) => ({
      id: e.id,
      orderIndex: e.orderIndex,
      fen: e.fen,
      objective: e.objective,
      hintLevels: e.hintLevels as string[],
      explanation: e.explanation,
    })),
    progress: progress
      ? {
          currentExercise: progress.currentExercise,
          completed: progress.completed,
          score: progress.score,
          exerciseResults: progress.exerciseResults,
          startedAt: progress.startedAt.toISOString(),
          completedAt: progress.completedAt?.toISOString() ?? null,
        }
      : null,
  };
}

export const trainingService = {
  async getRecommendations(userId: string) {
    const analyses = await analysisRepository.aggregateWeaknesses(userId);
    const weaknessCounts = new Map<string, number>();

    for (const analysis of analyses) {
      const moves = analysis.moveAnalysis as Array<{
        classification?: string;
        isUserMove?: boolean;
      }>;
      if (!Array.isArray(moves)) continue;
      for (const move of moves) {
        if (!move.isUserMove) continue;
        const key = move.classification ?? "inaccuracy";
        if (["blunder", "mistake", "inaccuracy"].includes(key)) {
          weaknessCounts.set(key, (weaknessCounts.get(key) ?? 0) + 1);
        }
      }
    }

    const hasEnoughData = analyses.length >= 5;
    const weaknesses = [...weaknessCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, count]) => ({ tag, count }));

    const lessons = await lessonRepository.findByUser(userId, { status: "READY" });

    return {
      hasEnoughData,
      weaknesses,
      recommendedTopics: hasEnoughData
        ? weaknesses.map((w) => WEAKNESS_TOPICS[w.tag] ?? "TACTICS")
        : (["TACTICS", "OPENING"] as LessonTopic[]),
      activeLessons: lessons.filter((l) =>
        l.progress.some((p) => !p.completed),
      ).length,
    };
  },

  async listLessons(userId: string, topic?: LessonTopic) {
    const lessons = await lessonRepository.findByUser(userId, {
      status: "READY",
      topic,
    });
    return lessons.map((l) => mapLesson(l as never, userId));
  },

  async getLesson(userId: string, lessonId: string) {
    const lesson = await lessonRepository.findById(lessonId);
    if (!lesson || lesson.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Lesson not found", 404);
    }
    return mapLesson(lesson, userId);
  },

  async generateLesson(
    userId: string,
    input: { topic?: LessonTopic; weakness?: string },
  ) {
    ensureAIConfigured();

    const topic = input.topic ?? "TACTICS";
    const lesson = await lessonRepository.create({
      userId,
      title: "Generating lesson…",
      description: "Your personalized lesson is being created.",
      topic,
      difficulty: 5,
      sourceWeakness: input.weakness ?? null,
      status: "GENERATING",
    });

    try {
      const provider = getAIProvider() as GeminiProvider;
      const prompt = buildLessonGenerationPrompt({
        topic,
        weakness: input.weakness,
        skillLevel: 5,
      });

      let parsed;
      try {
        const raw = await provider.generateText(prompt, 0.6);
        parsed = parseGeminiResponse(raw, lessonResponseSchema);
      } catch {
        const raw = await provider.generateText(prompt, 0.4);
        parsed = parseGeminiResponse(raw, lessonResponseSchema);
      }

      const validExercises = parsed.exercises.filter((e) =>
        validateExercise(e.fen, e.solutionUci),
      );

      if (validExercises.length === 0) {
        await lessonRepository.updateStatus(lesson.id, "ARCHIVED");
        throw new ApiError(
          "SERVICE_UNAVAILABLE",
          "Could not generate valid exercises. Try again later.",
          503,
        );
      }

      await lessonRepository.createExercises(
        lesson.id,
        validExercises.map((e, i) => ({
          orderIndex: i,
          fen: e.fen,
          objective: e.objective,
          solutionUci: e.solutionUci,
          hintLevels: e.hintLevels,
          explanation: e.explanation,
        })),
      );

      await prisma.trainingLesson.update({
        where: { id: lesson.id },
        data: {
          title: parsed.title,
          description: parsed.description,
          difficulty: parsed.difficulty,
          status: "READY",
        },
      });

      const full = await lessonRepository.findById(lesson.id);
      if (!full) {
        throw new ApiError("INTERNAL_ERROR", "Lesson not found after creation", 500);
      }
      return mapLesson(full, userId);
    } catch (error) {
      await lessonRepository.updateStatus(lesson.id, "ARCHIVED");
      throw error;
    }
  },

  async updateProgress(
    userId: string,
    lessonId: string,
    input: {
      currentExercise: number;
      exerciseCorrect?: boolean;
      completed?: boolean;
    },
  ) {
    const lesson = await lessonRepository.findById(lessonId);
    if (!lesson || lesson.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Lesson not found", 404);
    }

    const existing = await lessonRepository.findProgress(userId, lessonId);
    const results = (existing?.exerciseResults as Record<string, boolean>) ?? {};
    if (input.exerciseCorrect !== undefined) {
      results[String(input.currentExercise)] = input.exerciseCorrect;
    }

    const total = lesson.exercises.length;
    const correctCount = Object.values(results).filter(Boolean).length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const completed = input.completed ?? input.currentExercise >= total - 1;

    const progress = await lessonRepository.upsertProgress(userId, lessonId, {
      currentExercise: input.currentExercise,
      completed,
      score,
      exerciseResults: results,
      completedAt: completed ? new Date() : null,
    });

    return {
      currentExercise: progress.currentExercise,
      completed: progress.completed,
      score: progress.score,
      exerciseResults: progress.exerciseResults,
    };
  },

  async getStudyPlan(userId: string) {
    const active = await lessonRepository.findActiveProgress(userId);
    const recommendations = await this.getRecommendations(userId);

    return {
      activeLessons: active.map((p) => ({
        lessonId: p.lessonId,
        title: p.lesson.title,
        topic: p.lesson.topic,
        currentExercise: p.currentExercise,
        totalExercises: p.lesson.exercises.length,
        startedAt: p.startedAt.toISOString(),
      })),
      recommendations,
    };
  },

  async getHint(
    userId: string,
    lessonId: string,
    exerciseIndex: number,
    hintLevel: number,
  ) {
    ensureAIConfigured();
    const lesson = await lessonRepository.findById(lessonId);
    if (!lesson || lesson.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Lesson not found", 404);
    }

    const exercise = lesson.exercises.find((e) => e.orderIndex === exerciseIndex);
    if (!exercise) {
      throw new ApiError("NOT_FOUND", "Exercise not found", 404);
    }

    const hints = exercise.hintLevels as string[];
    if (hintLevel <= hints.length && hints[hintLevel - 1]) {
      return { hint: hints[hintLevel - 1]!, level: hintLevel, showSolution: false };
    }

    const provider = getAIProvider() as GeminiProvider;
    const prompt = buildHintGenerationPrompt({
      fen: exercise.fen,
      objective: exercise.objective,
      hintLevel,
      previousHints: hints.slice(0, hintLevel - 1),
    });
    const raw = await provider.generateText(prompt, 0.4);
    const parsed = parseGeminiResponse(raw, hintResponseSchema);

    return {
      hint: parsed.hint,
      level: hintLevel,
      showSolution: hintLevel >= 3,
      solution: hintLevel >= 3 ? exercise.solutionUci : undefined,
      explanation: hintLevel >= 3 ? exercise.explanation : undefined,
    };
  },

  async verifyExercise(
    userId: string,
    lessonId: string,
    exerciseIndex: number,
    uci: string,
  ) {
    const lesson = await lessonRepository.findById(lessonId);
    if (!lesson || lesson.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Lesson not found", 404);
    }

    const exercise = lesson.exercises.find((e) => e.orderIndex === exerciseIndex);
    if (!exercise) {
      throw new ApiError("NOT_FOUND", "Exercise not found", 404);
    }

    const attempt = validateUciMove(exercise.fen, [], uci);
    if (!attempt.valid || !attempt.uci) {
      return { correct: false };
    }

    return {
      correct:
        attempt.uci.toLowerCase() === exercise.solutionUci.toLowerCase(),
    };
  },
};
