import { describe, expect, it, vi, beforeEach } from "vitest";
import { gameService } from "@/server/services/game.service";
import { gameRepository } from "@/server/repositories/game.repository";

vi.mock("@/server/repositories/game.repository", () => ({
  gameRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findByUser: vi.fn(),
    addMove: vi.fn(),
    findMoveByNumber: vi.fn(),
    complete: vi.fn(),
    resign: vi.fn(),
    delete: vi.fn(),
  },
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
});
