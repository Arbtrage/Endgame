import { prisma } from "@/shared/db/prisma";
import type { InviteStatus } from "@prisma/client";

const inviteInclude = {
  inviter: { select: { id: true, name: true, email: true, image: true } },
  invitee: { select: { id: true, name: true, email: true, image: true } },
  game: { select: { id: true, status: true } },
} as const;

export const pvpInviteRepository = {
  create(data: {
    inviterId: string;
    inviteeId: string;
    inviterColor: string;
    timeControlInitial: number | null;
    timeControlIncrement: number | null;
    expiresAt: Date;
  }) {
    return prisma.gameInvite.create({
      data,
      include: inviteInclude,
    });
  },

  findById(id: string) {
    return prisma.gameInvite.findUnique({
      where: { id },
      include: inviteInclude,
    });
  },

  findByToken(token: string) {
    return prisma.gameInvite.findUnique({
      where: { token },
      include: inviteInclude,
    });
  },

  findPendingBetween(inviterId: string, inviteeId: string) {
    return prisma.gameInvite.findFirst({
      where: {
        inviterId,
        inviteeId,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      include: inviteInclude,
    });
  },

  listPendingForUser(userId: string) {
    return prisma.gameInvite.findMany({
      where: {
        status: "PENDING",
        expiresAt: { gt: new Date() },
        OR: [{ inviterId: userId }, { inviteeId: userId }],
      },
      include: inviteInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  listActiveAcceptedForUser(userId: string) {
    return prisma.gameInvite.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ inviterId: userId }, { inviteeId: userId }],
        game: { status: "IN_PROGRESS" },
      },
      include: inviteInclude,
      orderBy: { respondedAt: "desc" },
      take: 10,
    });
  },

  updateStatus(
    id: string,
    status: InviteStatus,
    data?: { gameId?: string; respondedAt?: Date },
  ) {
    return prisma.gameInvite.update({
      where: { id },
      data: {
        status,
        respondedAt: data?.respondedAt ?? new Date(),
        ...(data?.gameId ? { gameId: data.gameId } : {}),
      },
      include: inviteInclude,
    });
  },

  expireStale() {
    return prisma.gameInvite.updateMany({
      where: {
        status: "PENDING",
        expiresAt: { lte: new Date() },
      },
      data: {
        status: "EXPIRED",
        respondedAt: new Date(),
      },
    });
  },
};
