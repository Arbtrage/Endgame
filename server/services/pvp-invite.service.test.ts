import { describe, expect, it, vi, beforeEach } from "vitest";
import { pvpInviteService } from "@/server/services/pvp-invite.service";
import { pvpInviteRepository } from "@/server/repositories/pvp-invite.repository";
import { userRepository } from "@/server/repositories/user.repository";
import { gameRepository } from "@/server/repositories/game.repository";

vi.mock("@/server/repositories/pvp-invite.repository", () => ({
  pvpInviteRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findByToken: vi.fn(),
    findPendingBetween: vi.fn(),
    listPendingForUser: vi.fn(),
    updateStatus: vi.fn(),
    expireStale: vi.fn(),
  },
}));

vi.mock("@/server/repositories/user.repository", () => ({
  userRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("@/server/repositories/game.repository", () => ({
  gameRepository: {
    createPvp: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock("@/server/email/send-game-invite", () => ({
  sendGameInviteEmail: vi.fn().mockResolvedValue({ sent: true }),
}));

vi.mock("@/server/realtime/pusher", () => ({
  triggerOpponentJoined: vi.fn(),
  triggerRematchOffered: vi.fn(),
}));

const baseInvite = {
  id: "invite-1",
  token: "token-1",
  inviterId: "user-a",
  inviteeId: "user-b",
  status: "PENDING" as const,
  inviterColor: "white",
  timeControlInitial: 600,
  timeControlIncrement: 0,
  gameId: null,
  expiresAt: new Date(Date.now() + 60_000),
  createdAt: new Date(),
  respondedAt: null,
  inviter: {
    id: "user-a",
    name: "Alice",
    email: "alice@example.com",
    image: null,
  },
  invitee: {
    id: "user-b",
    name: "Bob",
    email: "bob@example.com",
    image: null,
  },
  game: null,
};

describe("pvpInviteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(pvpInviteRepository.expireStale).mockResolvedValue({ count: 0 });
  });

  it("rejects self-invite", async () => {
    await expect(
      pvpInviteService.createInvite("user-a", {
        inviteeId: "user-a",
        inviterColor: "white",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("creates invite and sends email", async () => {
    vi.mocked(userRepository.findById)
      .mockResolvedValueOnce({ id: "user-a", name: "Alice", email: "alice@example.com" } as never)
      .mockResolvedValueOnce({ id: "user-b", name: "Bob", email: "bob@example.com" } as never);
    vi.mocked(pvpInviteRepository.findPendingBetween).mockResolvedValue(null);
    vi.mocked(pvpInviteRepository.create).mockResolvedValue(baseInvite as never);

    const invite = await pvpInviteService.createInvite("user-a", {
      inviteeId: "user-b",
      inviterColor: "white",
    });

    expect(invite.id).toBe("invite-1");
    expect(pvpInviteRepository.create).toHaveBeenCalled();
  });

  it("accepts invite and creates PVP game", async () => {
    vi.mocked(pvpInviteRepository.findById).mockResolvedValue(baseInvite as never);
    vi.mocked(gameRepository.createPvp).mockResolvedValue({
      id: "game-pvp-1",
      mode: "PVP",
      status: "IN_PROGRESS",
      whiteUserId: "user-a",
      blackUserId: "user-b",
      playerColor: "white",
      timeControlInitial: 600,
      timeControlIncrement: 0,
    } as never);
    vi.mocked(pvpInviteRepository.updateStatus).mockResolvedValue({
      ...baseInvite,
      status: "ACCEPTED",
      gameId: "game-pvp-1",
      game: { id: "game-pvp-1", status: "IN_PROGRESS" },
    } as never);

    const result = await pvpInviteService.acceptInvite("user-b", "invite-1");

    expect(result.game.id).toBe("game-pvp-1");
    expect(gameRepository.createPvp).toHaveBeenCalled();
  });

  it("creates rematch invite with swapped colors after completed game", async () => {
    vi.mocked(gameRepository.findById).mockResolvedValue({
      id: "game-pvp-1",
      mode: "PVP",
      status: "COMPLETED",
      whiteUserId: "user-a",
      blackUserId: "user-b",
      timeControlInitial: 600,
      timeControlIncrement: 0,
    } as never);
    vi.mocked(pvpInviteRepository.findPendingBetween).mockResolvedValue(null);
    vi.mocked(userRepository.findById).mockResolvedValue({
      id: "user-a",
      name: "Alice",
      email: "alice@example.com",
    } as never);
    vi.mocked(pvpInviteRepository.create).mockResolvedValue({
      ...baseInvite,
      inviterColor: "black",
    } as never);

    const invite = await pvpInviteService.createRematchInvite(
      "user-a",
      "game-pvp-1",
    );

    expect(invite.inviterColor).toBe("black");
    expect(pvpInviteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        inviterId: "user-a",
        inviteeId: "user-b",
        inviterColor: "black",
      }),
    );
  });
});
