import { prisma } from "@/shared/db/prisma";

export const gameMessageRepository = {
  create(data: { gameId: string; userId: string; content: string }) {
    return prisma.gameMessage.create({
      data,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },

  listByGame(gameId: string, limit: number) {
    return prisma.gameMessage.findMany({
      where: { gameId },
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },
};
