import { prisma } from "@/shared/db/prisma";
import type { Prisma } from "@prisma/client";

export const chatRepository = {
  createSession(userId: string, context?: Prisma.InputJsonValue) {
    return prisma.chatSession.create({
      data: {
        userId,
        context,
      },
    });
  },

  findSession(sessionId: string, userId: string) {
    return prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },

  findLatestSession(userId: string) {
    return prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },

  addMessage(data: {
    sessionId: string;
    role: string;
    content: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.$transaction([
      prisma.chatMessage.create({
        data: {
          sessionId: data.sessionId,
          role: data.role,
          content: data.content,
          metadata: data.metadata,
        },
      }),
      prisma.chatSession.update({
        where: { id: data.sessionId },
        data: { updatedAt: new Date() },
      }),
    ]);
  },

  updateSessionContext(sessionId: string, context: Prisma.InputJsonValue) {
    return prisma.chatSession.update({
      where: { id: sessionId },
      data: { context },
    });
  },

  listSessions(
    userId: string,
    filters: { page: number; pageSize: number },
  ) {
    const skip = (filters.page - 1) * filters.pageSize;
    return prisma.$transaction([
      prisma.chatSession.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        skip,
        take: filters.pageSize,
        include: {
          messages: {
            where: { role: "user" },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
          _count: { select: { messages: true } },
        },
      }),
      prisma.chatSession.count({ where: { userId } }),
    ]);
  },
};
