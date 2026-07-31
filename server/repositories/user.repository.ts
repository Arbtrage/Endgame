import { prisma } from "@/shared/db/prisma";

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { settings: true },
    });
  },

  updateProfile(id: string, data: { name: string }) {
    return prisma.user.update({
      where: { id },
      data,
      include: { settings: true },
    });
  },

  updateOnboarding(
    id: string,
    data: { skillEstimate?: number; onboardingComplete?: boolean },
  ) {
    return prisma.user.update({
      where: { id },
      data,
      include: { settings: true },
    });
  },

  getSettings(userId: string) {
    return prisma.userSettings.findUnique({ where: { userId } });
  },

  updateSettings(
    userId: string,
    data: Partial<{
      boardTheme: string;
      pieceSet: string;
      soundEnabled: boolean;
      defaultStockfishLevel: number;
      defaultAiPersonality: string;
      coachAutoExplain: boolean;
    }>,
  ) {
    return prisma.userSettings.update({
      where: { userId },
      data,
    });
  },

  ensureSettings(userId: string) {
    return prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  },

  searchUsers(query: string, excludeUserId: string, limit: number) {
    return prisma.user.findMany({
      where: {
        id: { not: excludeUserId },
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: limit,
      orderBy: { name: "asc" },
    });
  },
};
