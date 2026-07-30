import { beforeEach, describe, expect, it, vi } from "vitest";
import { coachingService } from "@/server/services/coaching.service";
import { gameRepository } from "@/server/repositories/game.repository";

vi.mock("@/server/repositories/game.repository", () => ({
  gameRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("@/server/repositories/coach-moment.repository", () => ({
  coachMomentRepository: {
    create: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/server/repositories/chat.repository", () => ({
  chatRepository: {
    findSession: vi.fn(),
    findLatestSession: vi.fn(),
    createSession: vi.fn(),
    addMessage: vi.fn(),
    updateSessionContext: vi.fn(),
  },
}));

const mockGenerateMove = vi.fn();
const mockExplain = vi.fn();
const mockChat = vi.fn();

vi.mock("@/server/ai/factory", () => ({
  isAIConfigured: vi.fn(() => true),
  getAIProvider: vi.fn(() => ({
    generateMove: mockGenerateMove,
    explainPosition: mockExplain,
    chat: mockChat,
  })),
}));

describe("coachingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
  });

  it("requestAiMove validates and returns legal move", async () => {
    vi.mocked(gameRepository.findById).mockResolvedValue({
      id: "game-1",
      userId: "user-1",
      mode: "AI_OPPONENT",
      status: "IN_PROGRESS",
      playerColor: "white",
      moves: [],
    } as never);

    mockGenerateMove.mockResolvedValue({
      uci: "e7e5",
      comment: "Solid!",
    });

    const result = await coachingService.requestAiMove("user-1", "game-1", {
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      moves: ["e4"],
      personality: "intermediate",
    });

    expect(result.uci).toBe("e7e5");
    expect(result.san).toBe("e5");
  });

  it("returns 503 when AI not configured", async () => {
    const { isAIConfigured } = await import("@/server/ai/factory");
    vi.mocked(isAIConfigured).mockReturnValue(false);

    await expect(
      coachingService.requestAiMove("user-1", "game-1", {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moves: [],
        personality: "intermediate",
      }),
    ).rejects.toMatchObject({ statusCode: 503 });
  });
});
