import { prisma } from "@/shared/db/prisma";

export const coachMomentRepository = {
  create(data: {
    gameId: string;
    moveNumber: number;
    momentType: string;
    evalBefore: number;
    evalAfter: number;
    explanation: string;
  }) {
    return prisma.coachMoment.create({ data });
  },

  findByGame(gameId: string) {
    return prisma.coachMoment.findMany({
      where: { gameId },
      orderBy: { moveNumber: "asc" },
    });
  },
};
