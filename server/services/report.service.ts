import { ApiError } from "@/server/api/response";
import { getAIProvider, isAIConfigured } from "@/server/ai/factory";
import { GeminiProvider } from "@/server/ai/gemini.provider";
import { buildGameSummaryPrompt } from "@/server/ai/prompts/game-summary";
import { parseGeminiResponse } from "@/server/ai/parser";
import { analysisRepository } from "@/server/repositories/analysis.repository";
import { gameRepository } from "@/server/repositories/game.repository";
import { lessonRepository } from "@/server/repositories/lesson.repository";
import { prisma } from "@/shared/db/prisma";
import { z } from "zod";
import { calculateStreak } from "./report.service.helpers";

const summarySchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  studyTip: z.string(),
});

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export const reportService = {
  async getProgress(userId: string) {
    const analyses = await analysisRepository.findByUserId(userId, 30);
    const games = await prisma.game.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 50,
      select: {
        id: true,
        mode: true,
        result: true,
        playerColor: true,
        moveCount: true,
        completedAt: true,
        createdAt: true,
      },
    });

    const accuracyTrend = analyses
      .slice()
      .reverse()
      .map((a) => ({
        gameId: a.gameId,
        accuracy: a.accuracy,
        date: a.createdAt.toISOString(),
      }));

    const avgAccuracy =
      analyses.length > 0
        ? Math.round(
            (analyses.reduce((s, a) => s + a.accuracy, 0) / analyses.length) *
              10,
          ) / 10
        : null;

    const weaknessData = await analysisRepository.aggregateWeaknesses(userId);
    const weaknessCounts = new Map<string, number>();
    for (const analysis of weaknessData) {
      const moves = analysis.moveAnalysis as Array<{
        classification?: string;
        isUserMove?: boolean;
      }>;
      if (!Array.isArray(moves)) continue;
      for (const move of moves) {
        if (!move.isUserMove) continue;
        if (["blunder", "mistake", "inaccuracy"].includes(move.classification ?? "")) {
          weaknessCounts.set(
            move.classification!,
            (weaknessCounts.get(move.classification!) ?? 0) + 1,
          );
        }
      }
    }

    const weaknessTags = [...weaknessCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, count]) => ({ tag, count }));

    const streak = calculateStreak(games.map((g) => g.completedAt ?? g.createdAt));

    return {
      gamesPlayed: games.length,
      analyzedGames: analyses.length,
      avgAccuracy,
      accuracyTrend,
      weaknessTags,
      streak,
      games: games.map((g) => ({
        ...g,
        completedAt: g.completedAt?.toISOString() ?? null,
        createdAt: g.createdAt.toISOString(),
      })),
    };
  },

  async getLatestWeeklyReport(userId: string) {
    const report = await prisma.weeklyReport.findFirst({
      where: { userId },
      orderBy: { weekStart: "desc" },
    });
    if (!report) return null;
    return mapReport(report);
  },

  async getWeeklyReport(userId: string, weekId: string) {
    const report = await prisma.weeklyReport.findFirst({
      where: { id: weekId, userId },
    });
    if (!report) {
      throw new ApiError("NOT_FOUND", "Report not found", 404);
    }
    return mapReport(report);
  },

  async generateWeeklyReport(userId: string, forDate = new Date()) {
    const weekStart = startOfWeek(forDate);
    const weekEnd = endOfWeek(weekStart);

    const existing = await prisma.weeklyReport.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
    });
    if (existing) {
      return mapReport(existing);
    }

    const games = await prisma.game.findMany({
      where: {
        userId,
        status: "COMPLETED",
        completedAt: { gte: weekStart, lte: weekEnd },
      },
    });

    const analyses = await prisma.analysis.findMany({
      where: {
        userId,
        createdAt: { gte: weekStart, lte: weekEnd },
      },
    });

    const lessonsCompleted = await prisma.lessonProgress.count({
      where: {
        userId,
        completed: true,
        completedAt: { gte: weekStart, lte: weekEnd },
      },
    });

    const avgAccuracy =
      analyses.length > 0
        ? analyses.reduce((s, a) => s + a.accuracy, 0) / analyses.length
        : null;

    const weaknessTags = await extractWeaknessTags(userId);
    const narrative = await generateNarrative({
      gamesPlayed: games.length,
      lessonsCompleted,
      avgAccuracy,
      weaknessTags: weaknessTags.map((w) => w.tag),
    });

    const report = await prisma.weeklyReport.create({
      data: {
        userId,
        weekStart,
        weekEnd,
        gamesPlayed: games.length,
        lessonsCompleted,
        avgAccuracy,
        weaknessTags,
        narrative: narrative.summary,
        stats: {
          strengths: narrative.strengths,
          improvements: narrative.improvements,
          studyTip: narrative.studyTip,
        },
      },
    });

    return mapReport(report);
  },

  async generateAllWeeklyReports(forDate = new Date()) {
    const weekStart = startOfWeek(forDate);
    const users = await prisma.user.findMany({
      where: {
        games: {
          some: {
            status: "COMPLETED",
            completedAt: { gte: weekStart },
          },
        },
      },
      select: { id: true },
    });

    let generated = 0;
    for (const user of users) {
      try {
        await this.generateWeeklyReport(user.id, forDate);
        generated += 1;
      } catch (error) {
        console.error(`Failed weekly report for ${user.id}:`, error);
      }
    }
    return { generated, total: users.length };
  },

  async cleanupStaleData() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const abandoned = await prisma.game.deleteMany({
      where: {
        status: "IN_PROGRESS",
        updatedAt: { lt: cutoff },
      },
    });

    const oldChat = await prisma.chatMessage.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    return {
      abandonedGames: abandoned.count,
      oldChatMessages: oldChat.count,
    };
  },
};

function mapReport(report: {
  id: string;
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  gamesPlayed: number;
  lessonsCompleted: number;
  avgAccuracy: number | null;
  weaknessTags: unknown;
  narrative: string;
  stats: unknown;
  createdAt: Date;
}) {
  return {
    id: report.id,
    weekStart: report.weekStart.toISOString(),
    weekEnd: report.weekEnd.toISOString(),
    gamesPlayed: report.gamesPlayed,
    lessonsCompleted: report.lessonsCompleted,
    avgAccuracy: report.avgAccuracy,
    weaknessTags: report.weaknessTags as string[],
    narrative: report.narrative,
    stats: report.stats,
    createdAt: report.createdAt.toISOString(),
  };
}

async function extractWeaknessTags(userId: string) {
  const analyses = await analysisRepository.aggregateWeaknesses(userId);
  const counts = new Map<string, number>();
  for (const analysis of analyses) {
    const moves = analysis.moveAnalysis as Array<{
      classification?: string;
      isUserMove?: boolean;
    }>;
    if (!Array.isArray(moves)) continue;
    for (const move of moves) {
      if (!move.isUserMove) continue;
      if (["blunder", "mistake", "inaccuracy"].includes(move.classification ?? "")) {
        counts.set(move.classification!, (counts.get(move.classification!) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag, count]) => ({ tag, count }));
}

async function generateNarrative(params: {
  gamesPlayed: number;
  lessonsCompleted: number;
  avgAccuracy: number | null;
  weaknessTags: string[];
}) {
  if (!isAIConfigured()) {
    return {
      summary: `You played ${params.gamesPlayed} games and completed ${params.lessonsCompleted} lessons this week.${params.avgAccuracy ? ` Average accuracy: ${Math.round(params.avgAccuracy)}%.` : ""}`,
      strengths: ["Consistent play"],
      improvements: params.weaknessTags.length ? params.weaknessTags : ["Keep practicing"],
      studyTip: "Review your blunders in analysis mode.",
    };
  }

  const provider = getAIProvider() as GeminiProvider;
  const prompt = `Write a brief weekly chess coaching report.
Games played: ${params.gamesPlayed}
Lessons completed: ${params.lessonsCompleted}
Average accuracy: ${params.avgAccuracy ?? "N/A"}%
Top weaknesses: ${params.weaknessTags.join(", ") || "none yet"}

Respond with JSON: { "summary": "...", "strengths": ["..."], "improvements": ["..."], "studyTip": "..." }`;

  try {
    const raw = await provider.generateText(prompt, 0.4);
    return parseGeminiResponse(raw, summarySchema);
  } catch {
    return {
      summary: `You played ${params.gamesPlayed} games this week.`,
      strengths: ["Showing up to play"],
      improvements: ["Analyze your games"],
      studyTip: "Focus on one weakness at a time.",
    };
  }
}

export async function deleteUserAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
  return { deleted: true };
}
