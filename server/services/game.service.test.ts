import { describe, expect, it, vi, beforeEach } from "vitest";
import { gameService } from "@/server/services/game.service";
import { gameRepository } from "@/server/repositories/game.repository";

vi.mock("@/server/repositories/game.repository", () => ({
  gameRepository: {
    create: vi.fn(),
    createPvp: vi.fn(),
    findById: vi.fn(),
    findByIdWithUser: vi.fn(),
    findByUser: vi.fn(),
    addMove: vi.fn(),
    findMoveByNumber: vi.fn(),
    complete: vi.fn(),
    resign: vi.fn(),
    setDrawOffer: vi.fn(),
    clearDrawOffer: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/server/repositories/game-message.repository", () => ({
  gameMessageRepository: {
    create: vi.fn(),
    listByGame: vi.fn(),
  },
}));

vi.mock("@/server/realtime/pusher", () => ({
  triggerMoveMade: vi.fn(),
  triggerGameOver: vi.fn(),
  triggerOpponentJoined: vi.fn(),
  triggerDrawOffered: vi.fn(),
  triggerDrawDeclined: vi.fn(),
  triggerChatMessage: vi.fn(),
  triggerRematchOffered: vi.fn(),
}));

describe("gameService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a computer game", async () => {
    vi.mocked(gameRepository.create).mockResolvedValue({
      id: "game-1",
      userId: "user-1",
      mode: "COMPUTER",
      status: "IN_PROGRESS",
      result: null,
      resultReason: null,
      playerColor: "white",
      stockfishLevel: 5,
      aiPersonality: null,
      timeControlInitial: null,
      timeControlIncrement: null,
      pgn: null,
      finalFen: null,
      moveCount: 0,
      whiteUserId: null,
      blackUserId: null,
      pendingDrawOfferUserId: null,
      pendingDrawOfferAt: null,
      createdAt: new Date("2026-07-30T12:00:00Z"),
      updatedAt: new Date("2026-07-30T12:00:00Z"),
      completedAt: null,
    });

    const game = await gameService.createGame("user-1", {
      mode: "COMPUTER",
      color: "white",
      stockfishLevel: 5,
    });

    expect(game.id).toBe("game-1");
    expect(game.playerColor).toBe("white");
  });

  it("returns existing move when recording the same ply again", async () => {
    vi.mocked(gameRepository.findById).mockResolvedValue({
      id: "game-1",
      userId: "user-1",
      mode: "COMPUTER",
      status: "IN_PROGRESS",
      playerColor: "white",
      moveCount: 1,
      moves: [
        {
          id: "move-1",
          gameId: "game-1",
          moveNumber: 2,
          san: "e5",
          uci: "e7e5",
          fen: "fen-after-e5",
          color: "black",
          createdAt: new Date(),
        },
      ],
    } as never);

    const result = await gameService.recordMove("user-1", "game-1", {
      san: "e5",
      uci: "e7e5",
      fen: "fen-after-e5",
    });

    expect(result.moveNumber).toBe(2);
    expect(result.valid).toBe(true);
    expect(gameRepository.addMove).not.toHaveBeenCalled();
  });

  it("rejects PVP move when it is not the player's turn", async () => {
    vi.mocked(gameRepository.findById).mockResolvedValue({
      id: "game-1",
      userId: "user-white",
      mode: "PVP",
      status: "IN_PROGRESS",
      playerColor: "white",
      whiteUserId: "user-white",
      blackUserId: "user-black",
      moveCount: 0,
      moves: [],
      whiteUser: null,
      blackUser: null,
    } as never);

    await expect(
      gameService.recordMove("user-black", "game-1", {
        san: "e4",
        uci: "e2e4",
        fen: "fen",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("allows PVP participant to fetch game", async () => {
    vi.mocked(gameRepository.findById).mockResolvedValue({
      id: "game-1",
      userId: "user-white",
      mode: "PVP",
      status: "IN_PROGRESS",
      result: null,
      resultReason: null,
      playerColor: "white",
      stockfishLevel: null,
      aiPersonality: null,
      timeControlInitial: null,
      timeControlIncrement: null,
      pgn: null,
      finalFen: null,
      moveCount: 0,
      whiteUserId: "user-white",
      blackUserId: "user-black",
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      moves: [],
      whiteUser: {
        id: "user-white",
        name: "White",
        email: "white@example.com",
        image: null,
      },
      blackUser: {
        id: "user-black",
        name: "Black",
        email: "black@example.com",
        image: null,
      },
    } as never);

    const game = await gameService.getGame("user-black", "game-1");
    expect(game.id).toBe("game-1");
    expect(game.mode).toBe("PVP");
  });

  it("returns any game for spectator lookup without ownership check", async () => {
    vi.mocked(gameRepository.findByIdWithUser).mockResolvedValue({
      id: "game-1",
      userId: "owner-1",
      mode: "COMPUTER",
      status: "IN_PROGRESS",
      result: null,
      resultReason: null,
      playerColor: "white",
      stockfishLevel: 5,
      aiPersonality: null,
      timeControlInitial: null,
      timeControlIncrement: null,
      pgn: null,
      finalFen: null,
      moveCount: 1,
      createdAt: new Date("2026-07-30T12:00:00Z"),
      updatedAt: new Date("2026-07-30T12:00:00Z"),
      completedAt: null,
      moves: [
        {
          id: "move-1",
          gameId: "game-1",
          moveNumber: 1,
          san: "e4",
          uci: "e2e4",
          fen: "fen-after-e4",
          color: "white",
          createdAt: new Date(),
        },
      ],
      user: {
        id: "owner-1",
        name: "Owner",
        email: "owner@example.com",
      },
    } as never);

    const game = await gameService.getGameForSpectator("game-1");

    expect(game.id).toBe("game-1");
    expect(game.player.email).toBe("owner@example.com");
    expect(game.moves).toHaveLength(1);
    expect(gameRepository.findByIdWithUser).toHaveBeenCalledWith("game-1");
  });

  it("throws not found when spectator game does not exist", async () => {
    vi.mocked(gameRepository.findByIdWithUser).mockResolvedValue(null);

    await expect(gameService.getGameForSpectator("missing")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("accepts a pending draw offer and completes the game as a draw", async () => {
    vi.mocked(gameRepository.findById).mockResolvedValue({
      id: "game-1",
      userId: "user-white",
      mode: "PVP",
      status: "IN_PROGRESS",
      playerColor: "white",
      moveCount: 10,
      pendingDrawOfferUserId: "user-white",
      whiteUserId: "user-white",
      blackUserId: "user-black",
      pgn: "pgn",
      finalFen: "fen",
      moves: [{ fen: "fen" }],
      whiteUser: {
        id: "user-white",
        name: "White",
        email: "white@example.com",
        image: null,
      },
      blackUser: {
        id: "user-black",
        name: "Black",
        email: "black@example.com",
        image: null,
      },
    } as never);
    vi.mocked(gameRepository.complete).mockResolvedValue({
      id: "game-1",
      mode: "PVP",
      status: "COMPLETED",
      result: "DRAW",
      resultReason: "agreement",
      finalFen: "fen",
      userId: "user-white",
      playerColor: "white",
      stockfishLevel: null,
      aiPersonality: null,
      moveCount: 10,
      pgn: "pgn",
      timeControlInitial: null,
      timeControlIncrement: null,
      whiteUserId: "user-white",
      blackUserId: "user-black",
      pendingDrawOfferUserId: null,
      pendingDrawOfferAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: new Date(),
    } as never);

    const game = await gameService.acceptDraw("user-black", "game-1");

    expect(game.result).toBe("DRAW");
    expect(gameRepository.complete).toHaveBeenCalledWith(
      "game-1",
      expect.objectContaining({ result: "DRAW", resultReason: "agreement" }),
    );
  });
});
